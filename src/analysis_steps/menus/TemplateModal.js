import React, {useEffect, useState, useRef} from "react";
import globalConfig from "../../globalConfig";
import {Alert, Button, Col, Input, Menu, message, Modal, Popconfirm, Row, Tooltip} from "antd";
import {copyAnalysis, deleteAnalysis, duplicateAnalysis} from "../../analysis/BackendAnalysis";
import {useDispatch, useSelector} from "react-redux";
import {addTemplate, fetchAllTemplates, runTemplate} from "../../templates/BackendTemplates";
import '../../analysis/analysis.css'
import {CloseOutlined} from "@ant-design/icons";

export default function TemplateModal(props) {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [nameText, setNameText] = useState("");
    const [descriptionText, setDescriptionText] = useState("");
    const dispatch = useDispatch();


    useEffect(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, )

    const handleOk = () => {
        dispatch(addTemplate({analysisId: props.analysisId, name: nameText, description: descriptionText}))
        props.setIsModalVisible(false)
    }

    const handleCancel = () => {
        props.setIsModalVisible(false)
    }


    return (
        <div>
            <Modal title="Save analysis as template" visible={true} onOk={() => props.handleOk()}
                   onCancel={() => props.handleCancel()}>
                <Row gutter={[16, 16]}>
                    <Col span={8}><span>Name</span></Col>
                    <Col span={16}><Input onChange={(e) => setNameText(e.target.value)}></Input></Col>

                    <Col span={8}><span>Description</span></Col>
                    <Col span={16}><Input onChange={(e) => setDescriptionText(e.target.value)}></Input></Col>
                </Row>
            </Modal>
        </div>


    )
        ;
}