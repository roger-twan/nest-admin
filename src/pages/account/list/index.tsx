import { Button, Popconfirm, Table, message } from 'antd'
import type { TableProps } from 'antd'
import styles from './index.module.scss'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import useSWRMutation from 'swr/mutation'
import { postFetcher } from '@/utils/http'

function AccountListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { mutate } = useSWRConfig();
  const {data, isLoading} = useSWR(`/api/account/list?page=${page}&page_size=${pageSize}`);
  const {data: companyData} = useSWR(`/api/company/simple_list?page=1&page_size=100`);
  const { trigger: triggerDelete } = useSWRMutation('/api/account/delete', postFetcher);

  const deleteAccount = async (id: number) => {
    const result = await triggerDelete({ account_id: id })
    result.success ? message.success('删除成功') : message.error(result.message)
    mutate(`/api/account/list?page=${page}&page_size=${pageSize}`)
  }

  const columns: TableProps['columns'] = [
    {
      title: '邮箱',
      dataIndex: 'account_email',
      key: 'account_email',
    },
    {
      title: '管理权限',
      key: 'account_company_ids',
      render: (_, record) => {
        if (record.account_type === 1) {
          return '超级管理员'
        } else {
          return record.account_company_ids
            ? record.account_company_ids.split(',').map((id: string) =>
                companyData?.list.find((item: any) => item.company_id === Number(id))?.company_name
              ).join(' | ')
            : '-'
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 210,
      className: 'action-column',
      render: (_, record) => {
        if (record.account_type === 1) return '-';

        return (<>
          <Button type="link"
            onClick={() => navigate({
            pathname:'/account-management/manage-company',
            search: createSearchParams({
              id: record.account_id.toString(),
              email: record.account_email,
              companyIds: record.account_company_ids
          }).toString()
            })}>编辑权限</Button>
          <Button type="link" onClick={() => navigate({
            pathname:'/account-management/reset-password',
            search: createSearchParams({
              id: record.account_id.toString(),
              email: record.account_email
          }).toString()
            })}>重设密码</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => deleteAccount(record.account_id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={record.type === 1}
              danger
            >删除</Button>
          </Popconfirm>
        </>)
      },
    },
  ];

  return (
    <div className="page table-page">
      <Button
        type="primary"
        className={styles["add-btn"]}
        onClick={() => navigate('/account-management/new')}
      >
        新增账号
      </Button>
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="account_id"
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

export default AccountListPage
