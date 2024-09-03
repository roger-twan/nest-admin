import { Button, Popconfirm, Table, Tag, message } from 'antd'
import type { TableProps } from 'antd'
import styles from './index.module.scss'
import { createSearchParams, useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';

function MenuListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { mutate } = useSWRConfig();
  const url = `/api/menu/list?page=${page}&page_size=${pageSize}`
  const {data, isLoading} = useSWR(url);
  const {data: pageData} = useSWR(`/api/page/simple_list`);
  const { trigger: triggerUpdateStatus } = useSWRMutation('/api/menu/update', postFetcher);
  const { trigger: triggerSetTop } = useSWRMutation('/api/menu/set_top', postFetcher);
  const { trigger: triggerSetOrder } = useSWRMutation('/api/menu/set_order', postFetcher);
  const { trigger: triggerDelete } = useSWRMutation('/api/menu/delete', postFetcher);
  const updateStatus = async (id: number, value: string | number) => {
    const result = await triggerUpdateStatus({ menu_id: id, menu_status: value })
    result.success ? message.success(value === 1 ? '上架成功' : '下架成功') : message.error(result.message)
    mutate(url)
  }
  const setTop = async (id: number, order: number) => {
    const result = await triggerSetTop({ menu_id: id, menu_order: order })
    result.success ? message.success('置顶成功') : message.error(result.message)
    mutate(url)
  }
  const setOrder = async (id: number, order: number, type: 'up' | 'down') => {
    const result = await triggerSetOrder({ menu_id: id, menu_order: order, type })
    result.success ? message.success('排序成功') : message.error(result.message)
    mutate(`/api/menu/list?page=${page}&page_size=${pageSize}`)
  }
  const deleteMenu = async (id: number) => {
    const result = await triggerDelete({ menu_id: id })
    result.success ? message.success('删除成功') : message.error(result.message)
    mutate(url)
  }

  const columns: TableProps['columns'] = [
    {
      title: '菜单名称',
      key: 'menu_name',
      dataIndex: 'menu_name',
    },
    {
      title: '菜单链接',
      key: 'menu_link_id',
      render: (_, record) => {
        return Number(record.menu_link_type) === 2
          ? pageData?.list.find((page: any) => page.page_id === Number(record.menu_link_id))?.page_title
          : record.menu_link_id
      }
    },
    {
      title: '菜单链接类型',
      key: 'menu_link_type',
      dataIndex: 'menu_link_type',
      render(menu_link_type) {
        switch (menu_link_type) {
          case 1:
            return '官网链接'
          case 2:
            return '页面'
        }
      }
    },
    {
      title: '状态',
      dataIndex: 'menu_status',
      key: 'menu_status',
      render: (menu_status) => (
        menu_status === 1
        ? <Tag bordered={false} color="green">上架中</Tag>
        : <Tag bordered={false}>未上架</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 300,
      className: 'action-column',
      render: (_, record, index) => (
        <>
          <Popconfirm
            title="确认上架？"
            onConfirm={() => updateStatus(record.menu_id, 1)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={record.menu_status === 1}
            >
              上架
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认下架？"
            onConfirm={() => updateStatus(record.menu_id, 0)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={record.menu_status === 0}
            >
              下架
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => navigate({
            pathname:'/home-management/menu/edit',
            search: createSearchParams({
              id: record.menu_id
          }).toString()
            })}>编辑</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => deleteMenu(record.menu_id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              disabled={record.menu_status === 1 || record.menu_type === 1}
            >
              删除
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认置顶？"
            onConfirm={() => setTop(record.menu_id, record.menu_order)}
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
          <Popconfirm
            title="确认上移？"
            onConfirm={() => setOrder(record.menu_id, record.menu_order, 'up')}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={index === 0}
            >
              上移
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认下移？"
            onConfirm={() => setOrder(record.menu_id, record.menu_order, 'down')}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={index === data?.total - 1}
            >
              下移
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
        onClick={() => navigate('/home-management/menu/new')}
      >
        新建菜单
      </Button>
      
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="menu_id"
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

export default MenuListPage
