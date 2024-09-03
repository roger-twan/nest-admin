import { Button, Popconfirm, Popover, Table, message } from 'antd'
import type { TableProps } from 'antd'
import styles from './index.module.scss'
import { createSearchParams, useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';

function VideoListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { mutate } = useSWRConfig();
  const {data, isLoading} = useSWR(`/api/video/list?page=${page}&page_size=${pageSize}`);
  const { trigger: triggerDelete } = useSWRMutation('/api/video/delete', postFetcher);
  const deleteVideo = async (id: number) => {
    const result = await triggerDelete({ video_id: id })
    result.success ? message.success('删除成功') : message.error(result.message)
    mutate(`/api/video/list?page=${page}&page_size=${pageSize}`)
  }

  const columns: TableProps['columns'] = [
    {
      title: '视频封面',
      key: 'video_poster',
      dataIndex: 'video_poster',
      width: 120,
      render: (video_poster) => {
        const content = (
          <img className={styles["video-img"]} src={video_poster} alt="" />
        );
  
        return (
          <Popover content={content} placement="right">
            <img className={styles["video-img-preview"]} src={video_poster} alt="" />
          </Popover>
        )
      }
    },
    {
      title: '视频标题',
      key: 'video_title',
      dataIndex: 'video_title',
    },
    {
      title: '备注',
      dataIndex: 'video_description',
      key: 'video_description',
      width: "40%",
      render: (video_description) => video_description || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      className: 'action-column',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => navigate({
            pathname:'/home-management/video/edit',
            search: createSearchParams({
              id: record.video_id
          }).toString()
            })}>编辑</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => deleteVideo(record.video_id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
            >
              删除
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="page table-page">
      <Button
        type="primary"
        className={styles["add-btn"]}
        onClick={() => navigate('/home-management/video/new')}
      >
        上传视频
      </Button>
      
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="video_id"
        loading={isLoading}
        pagination={{
          pageSizeOptions: [10, 20, 50],
          current: page,
          pageSize: pageSize,
          total: data?.total,
          showTotal: (total: number) => `共 ${total} 条数据`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
      />
    </div>
  )
}

export default VideoListPage
