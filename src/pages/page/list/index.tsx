import { Button, Popconfirm, Table, message } from 'antd'
import type { TableProps } from 'antd'
import styles from './index.module.scss'
import { createSearchParams, useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';

function pageListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { mutate } = useSWRConfig();
  const {data, isLoading} = useSWR(`/api/page/list?page=${page}&page_size=${pageSize}`);
  const { trigger: triggerDelete } = useSWRMutation('/api/page/delete', postFetcher);
  const deletePage = async (id: number) => {
    const result = await triggerDelete({ page_id: id })
    result.success ? message.success('删除成功') : message.error(result.message)
    mutate(`/api/page/list?page=${page}&page_size=${pageSize}`)
  }

  const columns: TableProps['columns'] = [
    {
      title: '标题',
      key: 'page_title',
      dataIndex: 'page_title',
    },
    {
      title: '页面标识',
      key: 'page_identifier',
      dataIndex: 'page_identifier',
      render: (page_identifier) => page_identifier || '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      className: 'action-column',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => navigate({
            pathname:'/home-management/page/edit',
            search: createSearchParams({
              id: record.page_id
          }).toString()
            })}>编辑</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => deletePage(record.page_id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              disabled={record.page_status === 1}
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
        onClick={() => navigate('/home-management/page/new')}
      >
        新建页面
      </Button>
      
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="page_id"
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

export default pageListPage
