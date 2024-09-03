import { useEffect, useState } from 'react'
import { Button, Input, Select} from 'antd'
import useSWR from 'swr';
import styles from './page-banner.module.scss'
import { CloseOutlined } from '@ant-design/icons'
import Uploader from '@/components/uploader';

type PageBannerItemType = {
  banner_src: string,
  banner_link_type: number
  banner_link: string | number | null,
}

function PageBannerItem(props: {
  size: number[],
  index: number,
  value: PageBannerItemType,
  onChange?: (index: number, value: PageBannerItemType) => void
  onDelete?: (index: number) => void
}) {
  const [bannerLink, setBannerLink] = useState<string | number | null>(null)
  const {data: pageList} = useSWR('/api/page/list?page=1&page_size=100')
  const {
    size,
    value,
  } = props

  useEffect(() => {
    setBannerLink(value.banner_link)
  }, [value])

  const onChange = (value: any, field: string) => {
    const newVal = props.value
    if (field === 'banner_link_type') {
      newVal.banner_link = null
    }
    props.onChange && props.onChange(props.index, {
      ...newVal,
      [field]: value
    })
  }

  return (
    <div className={styles['page-banner-item']}>
      <Button
        shape="circle"
        type='primary'
        className={styles['close-btn']}
        icon={<CloseOutlined />}
        onClick={() => props.onDelete && props.onDelete(props.index)}
      />
      <Uploader
        size={size}
        max={1}
        value={value.banner_src}
        onUploaded={value => onChange(value, 'banner_src')}
      />
      
      <Select
        value={value.banner_link_type}
        className={styles['type-selector']}
        onChange={e => onChange(e, 'banner_link_type')}
        size='small'
      >
        <Select.Option value={1}>官网链接</Select.Option>
        <Select.Option value={2}>页面</Select.Option>
      </Select>
      {value.banner_link_type === 1 && (
        <Input
          value={bannerLink as string}
          size='small'
          placeholder='请输入链接'
          onChange={e => setBannerLink(e.target.value)}
          onBlur={e => onChange(e.target.value, 'banner_link')}
          allowClear
        />
      )}
      {value.banner_link_type === 2 && (
        <Select
          defaultValue={value.banner_link as number}
          size='small'
          placeholder='请选择页面'
          popupMatchSelectWidth={false}
          options={pageList?.list.map((item: any) => ({ label: item.page_title, value: item.page_id }))}
          onChange={e => onChange(e, 'banner_link')}
        />
      )}
    </div>
  )
}

export {type PageBannerItemType, PageBannerItem as default}
