import { Button, Popconfirm, Table, message } from 'antd'
import type { TableProps } from 'antd'
import styles from './index.module.scss'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { postFetcher } from '@/utils/http'
import { hasPermission } from '@/utils/auth'

function CompanyListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { mutate } = useSWRConfig();
  const {data, isLoading} = useSWR(`/api/company/list?page=${page}&page_size=${pageSize}`);
  const { trigger: triggerSetTop } = useSWRMutation('/api/company/set_top', postFetcher);
  const { trigger: triggerDelete } = useSWRMutation('/api/company/delete', postFetcher);
  const setTop = async (id: number) => {
    const result = await triggerSetTop({ company_id: id })
    result.success ? message.success('置顶成功') : message.error(result.message)
    mutate(`/api/company/list?page=${page}&page_size=${pageSize}`)
  }
  const deleteCompany = async (id: number) => {
    const result = await triggerDelete({ company_id: id })
    result.success ? message.success('删除成功') : message.error(result.message)
    mutate(`/api/company/list?page=${page}&page_size=${pageSize}`)
  }

  const columns: TableProps['columns'] = [
    {
      title: '分公司',
      dataIndex: 'company_name',
      key: 'company_name',
    },
    {
      title: '简介',
      dataIndex: 'company_intro',
      key: 'company_intro',
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      className: 'action-column',
      render: (_, record, index) => (
        <>
          <Button type="link" onClick={() => navigate({
            pathname:'/company-management/edit',
            search: createSearchParams({
              id: record.company_id
          }).toString()
            })}>编辑</Button>
          
          {hasPermission(['super']) && (
            <>
              <Popconfirm
                title="确认删除？"
                okText="确认"
                cancelText="取消"
                onConfirm={() => deleteCompany(record.company_id)}
                >
                <Button
                  type="link"
                  danger
                  disabled={!hasPermission(['super'])}
                >删除</Button>
              </Popconfirm>
              <Popconfirm
                title="确认置顶？"
                onConfirm={() => setTop(record.company_id)}
                okText="确认"
                cancelText="取消"
              >
                <Button
                  type="link"
                  disabled={index === 0}
                >
                  置顶
                </Button>
              </Popconfirm>
            </>
          )}
        </>
      ),
    },
  ];

  return (
    <div className="page table-page">
      {hasPermission(['super']) && <Button
          type="primary"
          className={styles["add-btn"]}
          onClick={() => navigate('/company-management/new')}
        >
          新增分公司
        </Button>
      }
      
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="company_id"
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

export default CompanyListPage
