import { Button, Checkbox, Divider, Input, Space, Table } from 'antd'
import type { InputRef, TableColumnType, TableProps } from 'antd'
import { FilterDropdownProps } from 'antd/es/table/interface'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import useSWR from 'swr'
import { CheckboxValueType } from 'antd/es/checkbox/Group'
import { useRef, useState } from 'react'
import { format } from 'date-fns'

function ApplicationDeleteHistoryPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchJobTitle, setSearchJobTitle] = useState('');
  const [searchCompanies, setSearchCompanies] = useState('');
  const [searchDepartment, setSearchDepartment] = useState('');
  const [searchApplicantName, setSearchApplicantName] = useState('');
  const [searchApplicantContact, setSearchApplicantContact] = useState('');
  const url = `/api/application/list?page=${page}&page_size=${pageSize}&job_title=${searchJobTitle}&companies=${searchCompanies}&department=${searchDepartment}&applicant_name=${searchApplicantName}&applicant_contact=${searchApplicantContact}&status=0`
  const {data, isLoading} = useSWR(url);
  const { data: companyList } = useSWR('/api/company/list?page=1&page_size=100');
  const searchInput = useRef<InputRef>(null)

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
      title: '删除时间',
      dataIndex: 'update_time',
      key: 'update_time',
      render: (update_time: any) => {
        return format(update_time, 'yyyy-MM-dd HH:mm:ss')
      }
    },
  ];

  return (
    <div className="page table-page">
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
      />
    </div>
  )
}

export default ApplicationDeleteHistoryPage
