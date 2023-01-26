import React, {useEffect, useState} from "react";
import {Checkbox, Select, Space, Row, Col} from 'antd';

const {Option} = Select;

export default function ScatterPlotParams(props) {

    console.log(props.commonResult)

    const [useDefaultCol, setUseDefaultCol] = useState()
    const [useColorBy, setUseColorBy] = useState()
    const numCols = props.commonResult.numericalColumns

    const expNames = props.commonResult.headers.reduce((acc, h) => {
        if (acc.field) {
            if (h.experiment && h.experiment.field === acc.field) {
                acc.res.push(h.experiment.name)
            }
        } else if (h.experiment) {
            acc.field = h.experiment.field
            acc.res.push(h.experiment.name)
        }
        return acc
    }, {field: undefined, res: []}).res

    const dataCols = props.commonResult.headers.reduce((acc, h) => {
        if (h.type === "NUMBER"){
            if(h.experiment){
                if(!acc.includes(h.experiment.field)) acc.push(h.experiment.field)
            }else{
                acc.push(h.name)
            }
        }
        return acc
    }, [])

    useEffect(() => {
        if (props.params) {
            if (useDefaultCol === undefined) {
                setUseDefaultCol(props.params.column ? false : true)
            }
        } else {
            props.setParams({xAxis: expNames[0], yAxis: expNames[1], column: props.intCol})
            setUseDefaultCol(true)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, useDefaultCol])

    function handleColChange(value) {
        props.setParams({...props.params, column: numCols[value]})
    }

    function handleColorColChange(value) {
        props.setParams({...props.params, colorBy: dataCols[value]})
    }

    function handleAxisChange(target) {
        return function (value) {
            const myParams = props.params
            myParams[target] = expNames[value]
            props.setParams(myParams)
        }
    }

    function changeUseDefaultCol(e) {
        setUseDefaultCol(e.target.checked)
        if (e.target.checked) props.setParams({...props.params, column: props.intCol})
    }

    function showOptions() {
        return <>
            <Space direction="vertical" size="middle">
                <Checkbox
                    onChange={changeUseDefaultCol} checked={useDefaultCol}>Use default intensity values [{props.intCol}]
                </Checkbox>
                <Select disabled={useDefaultCol} value={props.params.column} style={{width: 250}}
                        onChange={handleColChange}>
                    {numCols.map((n, i) => {
                        return <Option key={i} value={i}>{n}</Option>
                    })}</Select>
                <Row>
                    <Space direction={"horizontal"}>
                        <Col><span><strong>X axis</strong></span></Col>
                        <Col><Select value={props.params.xAxis} style={{width: 250}}
                                     onChange={handleAxisChange("xAxis")}>
                            {expNames.map((n, i) => {
                                return <Option key={i} value={i}>{n}</Option>
                            })}</Select></Col>
                    </Space>
                </Row>
                <Row>
                    <Space direction={"horizontal"}>
                        <Col><span><strong>X axis</strong></span></Col>
                        <Col><Select value={props.params.yAxis} style={{width: 250}}
                                     onChange={handleAxisChange("yAxis")}>
                            {expNames.map((n, i) => {
                                return <Option key={i} value={i}>{n}</Option>
                            })}</Select></Col>
                    </Space>
                </Row>
                <Checkbox
                    onChange={(e) => setUseColorBy(e.target.checked)} checked={useColorBy}>Color data points by
                </Checkbox>
                <Select disabled={!useColorBy} value={props.params.colorBy} style={{width: 250}}
                        onChange={handleColorColChange}>
                    {dataCols.map((n, i) => {
                        return <Option key={i} value={i}>{n}</Option>
                    })}</Select>
            </Space>
        </>
    }

    return (
        <>
            <h3>Select data column for Scatter plot</h3>
            {props.params && showOptions()}
        </>
    );
}