import React, { useCallback, useEffect, useState } from "react";
import {Table, Row, Col, Card, Empty, Space, Button} from "antd";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

import { mutliDragAwareReorder, multiSelectTo as multiSelect } from "./GroupTableDragUtils";
import "./multi_table_drag.css";
import {DeleteOutlined} from "@ant-design/icons";

const COLUMN_ID_DONE = "done";

// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
const PRIMARY_BUTTON_NUMBER = 0;

export const GroupTableDrag = (props) => {
    const [selectedTaskIds, setSelectedTaskIds] = useState([]);
    const [draggingTaskId, setDraggingTaskId] = useState(null);

    const baseTableColumns = [
        {
            title: "Title",
            dataIndex: "title"
        },
    ];

    const deleteTableColumns = baseTableColumns.concat({
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Button type={"text"} icon={<DeleteOutlined/>} onClick={() => confirmDelete(record.id)}></Button>
            </Space>
        ),
    },)

    const confirmDelete = (id) => {
        const newTasks = props.entities.tasks.filter( t => t.id !== id)

        const newColumns = Object.keys(props.entities.columns).reduce(function(result, key) {
            const col = props.entities.columns[key]
            const newTaskIds = col.taskIds.filter( t => t !== id)
            result[key] = {...col, taskIds: newTaskIds}
            return result
        }, {})

        props.setEntities({...props.entities, tasks: newTasks, columns: newColumns})
    };

    /**
     * On window click
     */
    const onWindowClick = useCallback((e) => {
        if (e.defaultPrevented) {
            return;
        }

        setSelectedTaskIds([]);
    }, []);

    /**
     * On window key down
     */
    const onWindowKeyDown = useCallback((e) => {
        if (e.defaultPrevented) {
            return;
        }

        if (e.key === "Escape") {
            setSelectedTaskIds([]);
        }
    }, []);

    /**
     * On window touch end
     */
    const onWindowTouchEnd = useCallback((e) => {
        if (e.defaultPrevented) {
            return;
        }

        setSelectedTaskIds([]);
    }, []);

    /**
     * Event Listener
     */
    useEffect(() => {
        window.addEventListener("click", onWindowClick);
        window.addEventListener("keydown", onWindowKeyDown);
        window.addEventListener("touchend", onWindowTouchEnd);

        return () => {
            window.removeEventListener("click", onWindowClick);
            window.removeEventListener("keydown", onWindowKeyDown);
            window.removeEventListener("touchend", onWindowTouchEnd);
        };
    }, [onWindowClick, onWindowKeyDown, onWindowTouchEnd]);

    /**
     * Droppable table body
     */
    const DroppableTableBody = ({ columnId, tasks, ...props }) => {
        return (
            <Droppable
                droppableId={columnId}
                // isDropDisabled={columnId === 'todo'}
            >
                {(provided, snapshot) => (
                    <tbody
                        ref={provided.innerRef}
                        {...props}
                        {...provided.droppableProps}
                        className={`${props.className} ${
                            snapshot.isDraggingOver && columnId === COLUMN_ID_DONE
                                ? "is-dragging-over"
                                : ""
                        }`}
                    ></tbody>
                )}
            </Droppable>
        );
    };

    /**
     * Draggable table row
     */
    const DraggableTableRow = ({ index, record, columnId, tasks, ...props }) => {
        const tableColumns = baseTableColumns

        if (!tasks.length) {
            return (
                <tr className="ant-table-placeholder row-item" {...props}>
                    <td colSpan={tableColumns.length} className="ant-table-cell">
                        <div className="ant-empty ant-empty-normal">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </div>
                    </td>
                </tr>
            );
        }

        if(!record) return null

        const isSelected = selectedTaskIds.some(
            (selectedTaskId) => selectedTaskId === record.id
        );
        const isGhosting =
            isSelected && Boolean(draggingTaskId) && draggingTaskId !== record.id;

        return (
            <Draggable
                key={props["data-row-key"]}
                draggableId={props["data-row-key"].toString()}
                index={index}
            >
                {(provided, snapshot) => {
                    return (
                        <tr
                            ref={provided.innerRef}
                            {...props}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`row-item ${isSelected ? "row-selected" : ""} ${
                                isGhosting ? "row-ghosting" : ""
                            } ${snapshot.isDragging ? "row-dragging" : ""}`}
                            // onClick={onClick}
                            // onTouchEnd={onTouchEnd}
                            // onKeyDown={event => onKeyDown(event, provided, snapshot)}
                        ></tr>
                    );
                }}
            </Draggable>
        );
    };

    /**
     * Get tasks
     */
    const getTasks = (entities, id) => {
        return entities.columns[id].taskIds.map((taskId) =>
            entities.tasks.find((item) => item.id === taskId)
        );
    };

    /**
     * On before capture
     */
    const onBeforeCapture = (start) => {
        const draggableId = start.draggableId;
        const selected = selectedTaskIds.find((taskId) => taskId === draggableId);

        // if dragging an item that is not selected - unselect all items
        if (!selected) {
            setSelectedTaskIds([]);
        }

        setDraggingTaskId(draggableId);
    };

    /**
     * On drag end
     */
    const onDragEnd = (result) => {
        const destination = result.destination;
        const source = result.source;

        // nothing to do
        if (!destination || result.reason === "CANCEL") {
            setDraggingTaskId(null);
            return;
        }

        const entities = props.entities

        const processed = mutliDragAwareReorder({
            entities,
            selectedTaskIds,
            source,
            destination
        });

        props.setEntities(processed.entities);
        setDraggingTaskId(null);
    };

    /**
     * Toggle selection
     */
    const toggleSelection = (taskId) => {
        const wasSelected = selectedTaskIds.includes(taskId);

        const newTaskIds = (() => {
            // Task was not previously selected
            // now will be the only selected item
            if (!wasSelected) {
                return [taskId];
            }

            // Task was part of a selected group
            // will now become the only selected item
            if (selectedTaskIds.length > 1) {
                return [taskId];
            }

            // task was previously selected but not in a group
            // we will now clear the selection
            return [];
        })();

        setSelectedTaskIds(newTaskIds);
    };

    /**
     * Toggle selection in group
     */
    const toggleSelectionInGroup = (taskId) => {
        const index = selectedTaskIds.indexOf(taskId);

        // if not selected - add it to the selected items
        if (index === -1) {
            setSelectedTaskIds([...selectedTaskIds, taskId]);

            return;
        }

        // it was previously selected and now needs to be removed from the group
        const shallow = [...selectedTaskIds];
        shallow.splice(index, 1);

        setSelectedTaskIds(shallow);
    };

    /**
     * Multi select to
     * This behaviour matches the MacOSX finder selection
     */
    const multiSelectTo = (newTaskId) => {
        const updated = multiSelect(props.entities, selectedTaskIds, newTaskId);

        if (updated == null) {
            return;
        }

        setSelectedTaskIds(updated);
        document.getSelection().removeAllRanges();
    };

    /**
     * On click to row
     * Using onClick as it will be correctly
     * preventing if there was a drag
     */
    const onClickRow = (e, record) => {
        if (e.defaultPrevented) {
            return;
        }

        if (e.button !== PRIMARY_BUTTON_NUMBER) {
            return;
        }

        // marking the event as used
        e.preventDefault();
        performAction(e, record);
    };

    /**
     * On touch end from row
     */
    const onTouchEndRow = (e, record) => {
        if (e.defaultPrevented) {
            return;
        }

        // marking the event as used
        // we would also need to add some extra logic to prevent the click
        // if this element was an anchor
        e.preventDefault();
        toggleSelectionInGroup(record.id);
    };

    /**
     * Was toggle in selection group key used
     * Determines if the platform specific toggle selection in group key was used
     */
    const wasToggleInSelectionGroupKeyUsed = (e) => {
        const isUsingWindows = navigator.platform.indexOf("Win") >= 0;
        return isUsingWindows ? e.ctrlKey : e.metaKey;
    };

    /**
     * Was multi select key used
     * Determines if the multiSelect key was used
     */
    const wasMultiSelectKeyUsed = (e) => e.shiftKey;

    /**
     * Perform action
     */
    const performAction = (e, record) => {
        if (wasToggleInSelectionGroupKeyUsed(e)) {
            toggleSelectionInGroup(record.id);
            return;
        }

        if (wasMultiSelectKeyUsed(e)) {
            multiSelectTo(record.id);
            return;
        }

        toggleSelection(record.id);
    };

    return (
        <>
            {props.entities && <Card
                className={`c-multi-drag-table ${draggingTaskId ? "is-dragging" : ""}`}
            >
                <DragDropContext
                    onBeforeCapture={onBeforeCapture}
                    onDragEnd={onDragEnd}
                >
                    <Row gutter={40}>
                        {props.entities.columnIds.map((id) => {
                            const tableColumns = (props.entities.columns[id].keepEntries) ? baseTableColumns : deleteTableColumns

                            return (
                            <Col key={id} xs={8}>
                                <div className="inner-col">
                                    <Row justify="space-between" align="middle">
                                        <h4>{props.entities.columns[id].title}</h4>
                                    </Row>
                                    <span>{}</span>

                                    <Table
                                        dataSource={getTasks(props.entities, id)}
                                        columns={tableColumns}
                                        rowKey="id"
                                        pagination={false}
                                        showHeader={false}
                                        components={{
                                            body: {
                                                // Custom tbody
                                                wrapper: (val) =>
                                                    DroppableTableBody({
                                                        columnId: props.entities.columns[id].id,
                                                        tasks: getTasks(props.entities, id),
                                                        ...val
                                                    }),
                                                // Custom td
                                                row: (val) => {
                                                    return DraggableTableRow({
                                                        tasks: getTasks(props.entities, id),
                                                        ...val
                                                    })
                                            }
                                            }
                                        }}
                                        // Set props on per row (td)
                                        onRow={(record, index) => ({
                                            index,
                                            record,
                                            onClick: (e) => onClickRow(e, record),
                                            onTouchEnd: (e) => onTouchEndRow(e, record)
                                        })}
                                    />
                                </div>
                            </Col>)}
                        )}
                    </Row>
                </DragDropContext>
            </Card>}
        </>
    );
};
