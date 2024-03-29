import React, {useState} from "react";
import {Button, Input} from "antd";
import {CheckOutlined, CloseOutlined, DeleteOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";

export default function GroupTitle(props) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(props.name);

    const save = () => {
        setIsEditing(!isEditing)
        props.changeGroupName(props.id, name)
    }

    const cancel = () => {
        setIsEditing(!isEditing)
    }

    const deleteGroup = () => {
        props.deleteGroup(props.id)
    }

    const moveLeft = () => {
        props.moveLeft(props.name, props.i)
    }

    const moveRight = () => {
        props.moveRight(props.name, props.i)
    }

    const renderMoveLeft = () => {
        if(!isEditing && props.id !== "experiments" && props.i > 1) return <Button onClick={() => moveLeft()} type={"text"} icon={<LeftOutlined/>}></Button>
        else return <span></span>
    }

    const renderMoveRight = () => {
        if(!isEditing && props.id !== "experiments" && !props.isLast) return <Button onClick={() => moveRight()} type={"text"} icon={<RightOutlined/>}></Button>
    }

    const edit = () => {
        setName(props.name)
        setIsEditing(true)
    }

    const change = (e) => {
        setName(e.target.value)
    }

    return (<>
            <div style={{minHeight: "35px"}}><span style={{float: "left"}}>{renderMoveLeft()}</span><span style={{float: "right"}}>{renderMoveRight()}</span></div>
            {!isEditing && <div>
                    <span style={{display: "block", float: "left", paddingTop: "5px"}}>
                        <h4 onClick={() => edit()} style={{paddingLeft: "18px"}}>
                            {props.name}
                        </h4>
                    </span>
                {props.id !== "experiments" &&
                    <span style={{display: "block", float: "right"}}>
                        <Button onClick={(e) => deleteGroup(e)} type={"text"} icon={<DeleteOutlined/>}></Button>
                    </span>}
            </div>}
            {isEditing && <span>
                            <Input
                                style={{width: 100}}
                                defaultValue={props.name}
                                onPressEnter={(e) => save(e)}
                                onChange={(e) => change(e)}
                                />
                                <Button shape="circle" icon={<CheckOutlined style={{fontSize: '10px'}}/>}
                                        onClick={(e) => save(e)} size={"small"}></Button>
                                <Button shape="circle" icon={<CloseOutlined style={{fontSize: '10px'}}/>}
                                        onClick={(e) => cancel(e)} size={"small"} danger></Button>
                </span>}
        </>);
}
