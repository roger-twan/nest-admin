import { Button, Popconfirm, Popover, Table, Tag, message } from 'antd'
import type { TableProps } from 'antd'
import styles from './index.module.scss'
import { createSearchParams, useNavigate } from 'react-router-dom';
import useSWR, { useSWRConfig } from 'swr';
import { useState } from 'react';
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';

function BannerListPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { mutate } = useSWRConfig();
  const {data, isLoading} = useSWR(`/api/banner/list?page=${page}&page_size=${pageSize}`);
  const { trigger: triggerUpdateStatus } = useSWRMutation('/api/banner/update', postFetcher);
  const { trigger: triggerSetTop } = useSWRMutation('/api/banner/set_top', postFetcher);
  const { trigger: triggerSetOrder } = useSWRMutation('/api/banner/set_order', postFetcher);
  const { trigger: triggerDelete } = useSWRMutation('/api/banner/delete', postFetcher);
  const updateStatus = async (id: number, value: string | number) => {
    const result = await triggerUpdateStatus({ banner_id: id, banner_status: value })
    result.success ? message.success(value === 1 ? '上架成功' : '下架成功') : message.error(result.message)
    mutate(`/api/banner/list?page=${page}&page_size=${pageSize}`)
  }
  const setTop = async (id: number, order: number) => {
    const result = await triggerSetTop({ banner_id: id, banner_order: order })
    result.success ? message.success('置顶成功') : message.error(result.message)
    mutate(`/api/banner/list?page=${page}&page_size=${pageSize}`)
  }
  const setOrder = async (id: number, order: number, type: 'up' | 'down') => {
    const result = await triggerSetOrder({ banner_id: id, banner_order: order, type })
    result.success ? message.success('排序成功') : message.error(result.message)
    mutate(`/api/banner/list?page=${page}&page_size=${pageSize}`)
  }
  const deleteBanner = async (id: number) => {
    const result = await triggerDelete({ banner_id: id })
    result.success ? message.success('删除成功') : message.error(result.message)
    mutate(`/api/banner/list?page=${page}&page_size=${pageSize}`)
  }

  const columns: TableProps['columns'] = [
    {
      title: 'Banner图',
      key: 'banner_src',
      dataIndex: 'banner_src',
      width: 120,
      render: (banner_src) => {
        const content = (
          <img className={styles["banner-img"]} src={banner_src} alt="" />
        );
  
        return (
          <Popover content={content} placement="right">
            <img className={styles["banner-img-preview"]} src={banner_src} alt="" />
          </Popover>
        )
      }
    },
    {
      title: '标题',
      key: 'banner_title',
      dataIndex: 'banner_title',
      render: (banner_title) => banner_title || '-'
    },
    {
      title: '描述',
      dataIndex: 'banner_description',
      key: 'banner_description',
      width: "40%",
      render: (banner_description) => banner_description || '-'
    },
    {
      title: '状态',
      dataIndex: 'banner_status',
      key: 'banner_status',
      render: (banner_status) => (
        banner_status === 1
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
            onConfirm={() => updateStatus(record.banner_id, 1)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={record.banner_status === 1}
            >
              上架
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认下架？"
            onConfirm={() => updateStatus(record.banner_id, 0)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              disabled={record.banner_status === 0}
            >
              下架
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => navigate({
            pathname:'/home-management/banner/edit',
            search: createSearchParams({
              id: record.banner_id
          }).toString()
            })}>编辑</Button>
          <Popconfirm
            title="确认删除？"
            onConfirm={() => deleteBanner(record.banner_id)}
            okText="确认"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              disabled={record.banner_status === 1}
            >
              删除
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认置顶？"
            onConfirm={() => setTop(record.banner_id, record.banner_order)}
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
            onConfirm={() => setOrder(record.banner_id, record.banner_order, 'up')}
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
            onConfirm={() => setOrder(record.banner_id, record.banner_order, 'down')}
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
        onClick={() => navigate('/home-management/banner/new')}
      >
        新建Banner
      </Button>
      
      <Table
        className="list-table"
        columns={columns}
        dataSource={data?.list || []}
        rowKey="banner_id"
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

export default BannerListPage
