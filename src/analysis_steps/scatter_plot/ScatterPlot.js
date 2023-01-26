import React, {useEffect, useState} from "react";
import {Button, Card} from "antd";
import AnalysisStepMenu from "../menus/AnalysisStepMenu";
import ReactECharts from 'echarts-for-react';
import {useDispatch} from "react-redux";
import {replacePlotIfChanged} from "../CommonStep";
import StepComment from "../StepComment";
import {FullscreenOutlined} from "@ant-design/icons";
import EchartsZoom from "../EchartsZoom";

export default function ScatterPlot(props) {
    const type = 'scatter-plot'
    const [localParams, setLocalParams] = useState()
    const [options, setOptions] = useState()
    const [isWaiting, setIsWaiting] = useState(true)
    const [showZoom, setShowZoom] = useState(null)
    const dispatch = useDispatch();

    useEffect(() => {
        if (props.data) {
            const params = JSON.parse(props.data.parameters)
            setLocalParams(params)

            if (isWaiting && props.data.status === 'done') {
                const results = JSON.parse(props.data.results)
                const echartOptions = getOptions(results, params)
                replacePlotIfChanged(props.data.id, results, echartOptions, dispatch)
                setOptions({count: options ? options.count + 1 : 0, data: echartOptions})
                setIsWaiting(false)
            }

            if (!isWaiting && props.data.status !== 'done') {
                setIsWaiting(true)
                const greyOpt = {...options.data, color: Array(30).fill('lightgrey')}
                setOptions({count: options ? options.count + 1 : 0, data: greyOpt})
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, isWaiting])

    const nrForm = (nr) => {
        return String(nr).length > 5 ? nr.toExponential(1) : nr
    }

    const getOptions = (results, params) => {
        console.log(results)

        const options = {
            dataset: [
                {
                    dimensions: ["x", "y", "name", "col"],
                    source: results.data.map(p => {
                        return [p.x, p.y, p.n, p.d]
                    }),
                }
            ],
            xAxis: {
                name: params.xAxis,
                nameLocation: "center",
                nameTextStyle: {
                    padding: [8, 4, 5, 6],
                    fontWeight: 'bold'
                },
                axisLabel: {
                    formatter: function (value) {
                        return nrForm(value)
                    }
                }
            },
            yAxis: {
                name: params.yAxis,
                nameLocation: "center",
                nameTextStyle: {
                    padding: [8, 4, 45, 6],
                    fontWeight: 'bold'
                },
                axisLabel: {
                    formatter: function (value) {
                        return nrForm(value)
                    }
                }
            },
            tooltip: {
                showDelay: 0,
                formatter: function (p) {
                    const text =  "<strong>" + p.data[2] + "</strong><br>" + params.xAxis + ": <strong>" + nrForm(p.data[0]) +
                        "</strong><br>" + params.yAxis + ": <strong>" + nrForm(p.data[1]) + "</strong>"
                    return (params.colorBy) ? (text + "<br>" + params.colorBy + "<strong>" + p.data[3].toFixed(1) + "</strong>" ): text
                },
            },
            legend: {},
            series: [{
                datasetIndex: 0,
                type: 'scatter',
                encode: {
                    x: 'x',
                    y: 'y',
                },
                largeThreshold: 500,
                symbolSize: 5,
            }],
            grid: {
                left: 75
            }
        };

        return (params.colorBy) ? {...options, visualMap: {
            dimension: 3,
            orient: 'vertical',
            right: 10,
            top: 'center',
            calculable: true,
            inRange: {
                color: ['#f2c31a', '#24b7f2']
            }
        }} : options
    }

    return (
        <Card className={'analysis-step-card'} title={props.data.nr + " - Scatter plot"} headStyle={{textAlign: 'left'}}
              bodyStyle={{textAlign: 'left'}} extra={
            <AnalysisStepMenu key={props.data.id + ':' + (options ? options.count : -1)}
                              stepId={props.data.id}
                              resultId={props.resultId}
                              status={props.data.status}
                              error={props.data.error}
                              paramType={type}
                              commonResult={props.data.commonResult}
                              intCol={props.data.columnInfo.columnMapping.intCol}
                              stepParams={localParams}
                              setStepParams={setLocalParams}
                              hasPlot={true}
                              echartOptions={options ? options.data : null}
                              hasImputed={props.data.imputationTablePath != null}
                              experimentDetails={props.data.columnInfo.columnMapping.experimentDetails}
            />
        }>
            {props.data.status === 'done' && <div style={{textAlign: 'right'}}>
                <Button size={'small'} type='default' onClick={() => setShowZoom(true)}
                        icon={<FullscreenOutlined/>}>Expand</Button>
            </div>}
            {props.data.copyDifference && <span className={'copy-difference'}>{props.data.copyDifference}</span>}
            {options && options.data && options.data.series.length > 0 &&
                <ReactECharts key={options.count} option={options.data}/>}
            <StepComment stepId={props.data.id} resultId={props.resultId} comment={props.data.comments}></StepComment>
            {options && <EchartsZoom showZoom={showZoom} setShowZoom={setShowZoom} echartsOptions={options.data}
                                     paramType={type} stepId={props.data.id}></EchartsZoom>}
        </Card>
    );
}