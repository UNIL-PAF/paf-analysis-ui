import React, {useEffect, useState} from "react";
import {Button, Checkbox, Select, Input, Tag} from 'antd';
import {Col, Row, Space} from 'antd';
import {CloseCircleOutlined, PlusCircleOutlined} from "@ant-design/icons";

const {Option} = Select;

export default function FilterParams(props) {
    const [remove, setRemove] = useState([])

    useEffect(() => {
        if (!props.params) {
            props.setParams({
                removeOnlyIdentifiedBySite: props.resType !== "Spectronaut",
                removeReverse: props.resType !== "Spectronaut",
                removePotentialContaminant: true,
                colFilters: []
            })
        }else{
            if(props.params.colFilters && props.params.colFilters.length > 0 && remove.length === 0){
                const parsedRemoves = props.params.colFilters.map( c => {return c.removeSelected ? "remove" : "keep"})
                setRemove(parsedRemoves)
            }
        }
    }, [props, remove.length])

    function handleChange(field, checked) {
        let newParams = {...props.params}
        newParams[field] = checked
        props.setParams(newParams)
    }

    function clickAddFilter() {
        const emptyFilter = {
            colName: '',
            comparator: 'eq',
            removeSelected: false,
            compareToValue: ''
        }
        setRemove([...remove, "keep"])
        props.setParams({...props.params, colFilters: [...props.params.colFilters, emptyFilter]})
    }

    function multiSelect(idx, field, value) {
        let newColFilters = props.params.colFilters
        newColFilters[idx][field] = value
        props.setParams({...props.params, colFilters: newColFilters})
    }

    function changeRemove(idx, value){
        let newColFilters = props.params.colFilters
        newColFilters[idx].removeSelected = (value === "remove" ? true : false)
        let newRemove = [...remove]
        newRemove[idx] = value
        setRemove(newRemove)
        props.setParams({...props.params, colFilters: newColFilters})
    }

    function getCompOptions(selColName){
        const selHead = props.commonResult.headers.find(h => h.name === selColName)
        const charType = (selHead && selHead.type === "CHARACTER") ? true : false

        return <>
            {!charType && <Option key={"gt"} value={"gt"}>{">"}</Option>}
            {!charType && <Option key={"sd"} value={"sd"}>{"<"}</Option>}
            <Option key={"eq"} value={"eq"}>{"=="}</Option>
            <Option key={"not"} value={"not"}>{"!="}</Option>
            {!charType && <Option key={"ge"} value={"ge"}>{">="}</Option>}
            {!charType && <Option key={"se"} value={"se"}>{"<="}</Option>}
        </>
    }

    function changeCompareVal(idx, e){
        let newColFilters = props.params.colFilters
        newColFilters[idx].compareToValue = e.target.value
        props.setParams({...props.params, colFilters: newColFilters})
    }

    function removeFilter(idx){
        let newColFilters = [...props.params.colFilters]
        newColFilters.splice(idx, 1)
        props.setParams({...props.params, colFilters: newColFilters})
    }

    function renderOneFilter(idx){
        const filter = props.params.colFilters[idx]

        return <Row gutter={3} key={'filter-'+idx}>
            <Col>
                <Select onChange={(v) => changeRemove(idx, v)} value={remove[idx]} size={"small"} style={{width: 90}}>
                    <Option key={"remove"} value={"remove"}>{"remove"}</Option>
                    <Option key={"keep"} value={"keep"}>{"keep"}</Option>
                </Select>
            </Col>
            <Col>
                <Select
                    value={filter.colName}
                    onChange={(v) => multiSelect(idx,"colName", v)}
                    size={"small"}
                    style={{width: 300}}
                    showSearch={true}
                    filterOption={(input, option) =>
                        option.children[0].toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    {props.commonResult.headers.map((n, i) => {
                        const myTag = n.type === "CHARACTER" ? <Tag style={{float: "right"}} color={"gold"}>Char</Tag> : <Tag style={{float: "right"}} color={"green"}>Num</Tag>

                        return <Option key={i} value={n.name}>{n.name} {myTag}</Option>
                    })}
                </Select>
            </Col>
            <Col>
                <Select value={filter.comparator} onChange={(v) => multiSelect(idx, "comparator", v)} size={"small"} style={{width: 60}}>
                    {getCompOptions(filter.colName)}
                </Select>
            </Col>
            <Col>
                <Input onChange={(e) => changeCompareVal(idx, e)} value={filter.compareToValue} size={"small"} style={{width: 90}}/>
            </Col>
            <Col>
                <Button onClick={(ex) => removeFilter(idx)} type={"text"} size={"small"} icon={<CloseCircleOutlined/>} />
            </Col>
        </Row>
    }

    return (<>
        {props.params &&
        <Row>
            <Col span={8}>
                <span>
                    <Checkbox checked={props.params.removeOnlyIdentifiedBySite}
                              disabled={props.resType === "Spectronaut"}
                              onChange={(e) => handleChange("removeOnlyIdentifiedBySite", e.target.checked)}>
                    </Checkbox>
                    <span style={{paddingLeft: "20px"}}>Remove only-identified-by-site</span>
                </span>
                <br/>
                <br/>
                <span>
                    <Checkbox checked={props.params.removeReverse}
                              disabled={props.resType === "Spectronaut"}
                              onChange={(e) => handleChange("removeReverse", e.target.checked)}>
                    </Checkbox>
                    <span style={{paddingLeft: "20px"}}>Remove reverse</span>
                </span>
                <br/>
                <br/>
                <span>
                    <Checkbox checked={props.params.removePotentialContaminant}
                              onChange={(e) => handleChange("removePotentialContaminant", e.target.checked)}>
                    </Checkbox>
                    <span style={{paddingLeft: "20px"}}>Remove potential contaminants</span>
                </span>
            </Col>
            <Col span={16}>
                <Space direction="vertical" size="middle">
                    <Row><Col>
                        <Button type="primary" icon={<PlusCircleOutlined/>} size={"small"} onClick={() => clickAddFilter()}>Add new
                            filter</Button>
                    </Col></Row>
                    {props.params.colFilters && props.params.colFilters.map( (f, i) => renderOneFilter(i))}
                </Space>
            </Col>
        </Row> }
    </>);
}
