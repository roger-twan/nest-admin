import { Button, Checkbox, Divider, Input, Popconfirm, Space, Table, Tag, message } from 'antd'
import type { InputRef, TableColumnType, TableProps } from 'antd'
import styles from './index.module.scss'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import useSWR, { mutate } from 'swr'
import { postFetcher } from '@/utils/http'
import useSWRMutation from 'swr/mutation'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import { hasPermission } from '@/utils/auth'
import { format } from 'date-fns'

function JobListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchCompanies, setSearchCompanies] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const url = `/api/job/list?page=${page}&page_size=${pageSize}&title=${searchTitle}&companies=${searchCompanies}&department=${searchDepartment}`
  const {data, isLoading} = useSWR(url);
  const { data: companyList } = useSWR('/api/company/list?page=1&page_size=100');
  const { trigger: triggerUpdateStatus } = useSWRMutation('/api/job/update', postFetcher);
  const { trigger: triggerDelete } = useSWRMutation('/api/job/delete', postFetcher);
  const searchInput = useRef<InputRef>(null)
  const updateStatus = async (id: number, value: string | number) => {
    const result = await triggerUpdateStatus({ job_id: id, job_status: value })
    result.success ? message.success(value === 1 ? '上架成功' : '下架成功') : message.error(result.message)
    mutate(url)
  }
  const deleteJob = async (id: number) => {
    const result = await triggerDelete({ job_id: id })
    result.success ? message.success('删除成功') : message.error(result.message)
    mutate(url)
  }

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: any,
  ) => {
    switch (dataIndex) {
      case 'job_title':
        setSearchTitle(selectedKeys[0] || '')
        break
      case 'job_department':
        setSearchDepartment(selectedKeys[0] || '')
        break
      case 'job_company_id':
        setSearchCompanies(selectedKeys.join(',') || '')
        break
    }
    confirm();
  };

  const getColumnSearchProps = (dataIndex: any): TableColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
            style={{ width: 90 }}
          >
            清空
          </Button>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            size="small"
            style={{ width: 90 }}
          >
            搜索
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#f15507' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  });

  const getColumnFilterProps = (dataIndex: any): TableColumnType<any> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Checkbox.Group
          options={companyList?.list?.map((item: any) => ({ label: item.company_name, value: item.company_id }))}
          value={selectedKeys as CheckboxValueType[]}
          onChange={(e: any) => setSelectedKeys(e || [])}
          style={{display: 'flex', flexDirection: 'column', marginBottom: 8}}
        />
        <Divider style={{ margin: '8px 0' }} />
        <Space>
          <Button
            onClick={() => clearFilters && clearFilters()}
            size="small"
          >
            重置
          </Button>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            size="small"
          >
            搜索
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <FilterOutlined style={{ color: filtered ? '#f15507' : undefined }} />
    ),
  });

  const columns: TableProps['columns'] = [
    {
      title: '职位',
      dataIndex: 'job_title',
      key: 'job_title',
      ...getColumnSearchProps('job_title'),
    },
    {
      title: '分公司',
      key: 'job_company_id',
      dataIndex: 'job_company_id',
      ...getColumnFilterProps('job_company_id'),
      render: (job_company_id) => companyList?.list.find((item: any) => item.company_id === job_company_id)?.company_name
    },
    {
      title: '部门',
      key: 'job_department',
      dataIndex: 'job_department',
      ...getColumnSearchProps('job_department'),
    },
    {
      title: '最近更新时间',
      key: 'update_time',
      dataIndex: 'update_time',
      render: (update_time) => format(update_time, 'yyyy-MM-dd HH:mm:ss')
    },
    {
      title: '状态',
      dataIndex: 'job_status',
      key: 'job_status',
      render: (job_status) => (
        job_status === 1
        ? <Tag bordered={false} color="green">上架中</Tag>
        : <Tag bordered={false}>未上架</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      className: 'action-column',
      render: (_, record) => (
        <>
          <Popconfirm
            title="确认上架？"
            onConfirm={() => updateStatus(record.job_id, 1)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={record.job_status === 1}
            >
              上架
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认下架？"
            onConfirm={() => updateStatus(record.job_id, 0)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={record.job_status === 0}
            >
              下架
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => navigate({
            pathname:'/job-management/edit',
            search: createSearchParams({
              id: record.job_id
          }).toString()
            })}>编辑</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => deleteJob(record.job_id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              disabled={record.job_status === 1}
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
      <Space className={styles["btn-wrapper"]}>
        {hasPermission(['super']) && (
          <Button
            onClick={() => navigate('/job-management/label')}
          >
            标签管理
          </Button>
        )}
        <Button
          type="primary"
          onClick={() => navigate('/job-management/new')}
        >
          新增招聘职位
        </Button>
      </Space>
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="job_id"
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

export default JobListPage
