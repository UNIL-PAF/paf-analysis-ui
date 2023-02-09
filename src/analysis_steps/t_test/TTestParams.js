import React, {useEffect, useState} from "react";
import {Checkbox, InputNumber, Select, Space} from 'antd';
import {GroupTableDrag} from "../menus/GroupTableDrag";

const {Option} = Select;

const getEntitiesMock = (experimentDetails) => {
    const availableGroups = Object.keys(experimentDetails).reduce(function(result, key) {
        const newGroup = experimentDetails[key].group
        if(! result.includes(newGroup)) return result.concat(newGroup)
        return result
    }, [])

    const initTasks = availableGroups.map( (group, i) => { return {id: String(i), title: group} })

    return {
        tasks: initTasks,
        columnIds: ["groups", "first", "second"],
        columns: {
            groups: {
                id: "groups",
                title: "Available groups",
                keepEntries: true,
                taskIds: initTasks.map(t => t.id)
            },
            first: {
                id: "first",
                title: "First group (right)",
                taskIds: []
            },
            second: {
                id: "second",
                title: "Second group (left)",
                taskIds: []
            }
        }
    }
};

export default function TTestParams(props) {

    const numCols = props.commonResult.numericalColumns
    const intCol = props.commonResult.intCol
    const [useDefaultCol, setUseDefaultCol] = useState()
    const [entities, setEntities] = useState();

    useEffect(() => {
        if(entities){
            const firstGroup = parseGroups("first")
            const secondGroup = parseGroups("second")
            props.setParams({...props.params, firstGroup: firstGroup, secondGroup: secondGroup })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entities])

    useEffect(() => {
        if(!entities && props.experimentDetails){
            setEntities(getEntitiesMock(props.experimentDetails))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, entities])

    useEffect(() => {
        if(!props.params){
            props.setParams({
                field: intCol,
                multiTestCorr: 'BH',
                signThres: 0.05
            })
            setUseDefaultCol(true)
        }else{
        if(useDefaultCol === undefined){
            setUseDefaultCol(props.params.field ? false: true)
        }
    }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props, useDefaultCol])

    function parseGroups(field){
        return entities.columns[field].taskIds.map(id => entities.tasks[id].title)
    }

    function changeUseDefaultCol(e){
        setUseDefaultCol(e.target.checked)
        if(e.target.checked) props.setParams({...props.params, field: null})
    }

    function handleChange(value) {
        props.setParams({...props.params, field: numCols[value]})
    }

    function valueChange(field, value) {
        let newParams = {...props.params}
        newParams[[field]] = value
        props.setParams(newParams)
    }

    function multiTestCorrChange(value) {
        props.setParams({...props.params, multiTestCorr: value})
    }

    function showOptions(){
        return <>
            <Space direction="vertical" size="middle">
            <Checkbox  
                    onChange={changeUseDefaultCol} checked={useDefaultCol}>Use default intensity values [{props.intCol}]
            </Checkbox>
            <Select
                disabled={useDefaultCol}
                value={props.params.field || props.intCol} style={{width: 250}} onChange={handleChange}>
                {numCols.map((n, i) => {
                    return <Option key={i} value={i}>{n}</Option>
                })}
            </Select>
            <span>
            <span style={{paddingRight: "10px"}}>Significance threshold</span>
            <InputNumber
                min={0.000001} max={0.999}
                value={props.params.signThres}
                onChange={(val) => valueChange("signThres", val)}></InputNumber>
        </span>
            <span>
            <span style={{paddingRight: "10px"}}>Multiple testing correction</span>
            <Select value={props.params.multiTestCorr} style={{width: 250}} onChange={multiTestCorrChange}>
                <Option value={'BH'}>Benjamini & Hochberg (FDR)</Option>
                <Option value={'none'}>None</Option>
            </Select>
        </span>
                {entities && <GroupTableDrag entities={entities}
                                setEntities={setEntities}/>}
            </Space>
        </>
    }

    return (
        <>
            {props.params && showOptions()}
        </>
    );

}
