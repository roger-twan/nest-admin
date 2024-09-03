import { Button, Checkbox, Divider, Input, Popconfirm, Space, Table, Tag, message } from 'antd'
import type { InputRef, TableColumnType, TableProps } from 'antd'
import styles from './index.module.scss'
import { useNavigate } from 'react-router-dom'
import { useRef, useState } from 'react'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import useSWR, { mutate } from 'swr'
import { postFetcher } from '@/utils/http'
import useSWRMutation from 'swr/mutation'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import { BASE_URL } from '@/router'
import { format } from 'date-fns'

function ApplicationListPage() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchJobTitle, setSearchJobTitle] = useState('');
  const [searchCompanies, setSearchCompanies] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchApplicantName, setSearchApplicantName] = useState('');
  const [searchApplicantContact, setSearchApplicantContact] = useState('');
  const [searchStatus, setSearchStatus] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const url = `/api/application/list?page=${page}&page_size=${pageSize}&job_title=${searchJobTitle}&companies=${searchCompanies}&department=${searchDepartment}&applicant_name=${searchApplicantName}&applicant_contact=${searchApplicantContact}&status=${searchStatus}`
  const {data, isLoading} = useSWR(url);
  const { data: companyList } = useSWR('/api/company/list?page=1&page_size=100');
  const { trigger: triggerDelete } = useSWRMutation('/api/application/delete', postFetcher);
  const searchInput = useRef<InputRef>(null)
  const deleteApplication = async (ids: number[]) => {
    const result = await triggerDelete({ ids: ids.join(',') })
    result.success ? message.success('删除成功') : message.error(result.message)
    setSelectedRowKeys([])
    mutate(url)
  }

  const getCheckboxOpts = (dataIndex: string) => {
    switch (dataIndex) {
      case 'application_company_id':
        return companyList?.list?.map((item: any) => ({ label: item.company_name, value: item.company_id }))
      case 'application_status':
        return [
          { label: '待查阅', value: 1 },
          { label: '有意向', value: 2 },
          { label: '邀面试', value: 3 },
          { label: '待入职', value: 4 },
          { label: '不匹配', value: 5 },
        ]
    }
  }

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: any,
  ) => {
    switch (dataIndex) {
      case 'application_job_title':
        setSearchJobTitle(selectedKeys[0] || '')
        break
      case 'application_department':
        setSearchDepartment(selectedKeys[0] || '')
        break
      case 'application_company_id':
        setSearchCompanies(selectedKeys.join(',') || '')
        break
      case 'applicant_name':
        setSearchApplicantName(selectedKeys[0] || '')
        break
      case 'applicant_contact':
        setSearchApplicantContact(selectedKeys[0] || '')
        break
      case 'application_status':
        setSearchStatus(selectedKeys.join(',') || '')
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
          options={getCheckboxOpts(dataIndex)}
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
      title: '申请职位',
      dataIndex: 'application_job_title',
      key: 'application_job_title',
      ...getColumnSearchProps('application_job_title'),
    },
    {
      title: '分公司',
      key: 'application_company_id',
      dataIndex: 'application_company_id',
      ...getColumnFilterProps('application_company_id'),
      render: (application_company_id) => companyList?.list.find((item: any) => item.company_id === application_company_id)?.company_name
    },
    {
      title: '部门',
      key: 'application_department',
      dataIndex: 'application_department',
      ...getColumnSearchProps('application_department'),
    },
    {
      title: '姓名',
      key: 'applicant_name',
      dataIndex: 'applicant_name',
      ...getColumnSearchProps('applicant_name'),
    },
    {
      title: '联系方式',
      key: 'applicant_contact',
      dataIndex: 'applicant_contact',
      ...getColumnSearchProps('applicant_contact'),
    },
    {
      title: '申请时间',
      key: 'apply_time',
      dataIndex: 'apply_time',
      render: (apply_time) => format(apply_time, 'yyyy-MM-dd HH:mm:ss')
    },
    {
      title: '状态',
      dataIndex: 'application_status',
      key: 'application_status',
      ...getColumnFilterProps('application_status'),
      render: (application_status) => {
        switch(application_status) {
          case 1:
            return <Tag>待查阅</Tag>
          case 2:
            return <Tag color="blue">有意向</Tag>
          case 3:
            return <Tag color="yellow">邀面试</Tag>
          case 4:
            return <Tag color="green">待入职</Tag>
          case 5:
            return <Tag color="red">不匹配</Tag>
        }
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      className: 'action-column',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => window.open(BASE_URL + '/application-management/detail?id=' + record.application_id)}
            >查看</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => deleteApplication([record.application_id])}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger>
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
        {!!selectedRowKeys.length && <Popconfirm
          title="确认批量删除？"
          onConfirm={() => deleteApplication(selectedRowKeys)}
          okText="确认"
          cancelText="取消"
        >
          <Button danger>
            批量删除
          </Button>
        </Popconfirm>}

        <Button
          type="text"
          onClick={() => navigate('/application-management/delete-history')}
        >
          删除历史
        </Button>
      </Space>
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="application_id"
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
        rowSelection={{
          type: 'checkbox',
          onChange: (selectedRowKeys) => setSelectedRowKeys(selectedRowKeys as number[]),
        }}
      />
    </div>
  )
}

export default ApplicationListPage
