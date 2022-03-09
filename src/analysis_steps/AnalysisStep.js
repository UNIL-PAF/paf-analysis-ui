import React from "react";
import InitialResult from "./initial_result/InitialResult";
import QualityControl from "./quality_control/QualityControl";
import {PlayCircleOutlined, FilePdfOutlined, PlusOutlined, SaveOutlined, PlusCircleOutlined} from "@ant-design/icons";
import {Button, Dropdown, Menu} from "antd";

export default function AnalysisStep(props) {

    const clickCopy = () => {
        console.log("clickCopy")
    }

    const analysisMenuList = (
        <Menu>
            <Menu.Item onClick={() => clickCopy()}
                       key={'copy-current'}>
                <span>Copy current Analysis</span>
            </Menu.Item>
            <Menu.Item onClick={() => clickCopy()}
                       key={'start-new'}>
                <span>Start new Analysis</span>
            </Menu.Item>
        </Menu>
    )


    return (<div className={"analysis-col"}>
            <h3>Analysis #{props.data.idx + 1} <span style={{float: "right"}}>
                <SaveOutlined style={{fontSize: '24px'}}/>
                &nbsp;
                <PlayCircleOutlined style={{fontSize: '24px'}}/>
                &nbsp;
                <FilePdfOutlined style={{fontSize: '24px'}}/>
                &nbsp;
                <Dropdown overlay={analysisMenuList} placement="bottomLeft"
                          arrow>
                <Button type={"text"} icon={<PlusOutlined style={{fontSize: '24px'}}/>}></Button>
            </Dropdown>

            </span></h3>
            <div>
                {props.data.analysisSteps && props.data.analysisSteps.map(step => {
                    switch (step.type) {
                        case 'initial-result':
                            return <InitialResult analysisIdx={props.analysisIdx} resultId={props.data.resultId}
                                                  data={step} key={step.id}/>
                        case 'quality-control':
                            return <QualityControl analysisIdx={props.analysisIdx} resultId={props.data.resultId}
                                                   data={step} key={step.id}/>
                        default:
                            return null
                    }
                })}
            </div>
        </div>

    );
}