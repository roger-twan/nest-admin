import { Space, message } from 'antd'
import PageBannerItem, { type PageBannerItemType } from './page-banner-item'
import { PlusOutlined } from '@ant-design/icons'
import styles from './page-banner.module.scss'

type PageBannerProps = {
  size: number[],
  list: PageBannerItemType[],
  onChange?: (list: PageBannerItemType[]) => void
}

function PageBanner(props: PageBannerProps) {
  const add = () => {
    for (const item of props.list) {
      for (let key in item) {
        if (item.hasOwnProperty(key)) {
          if ([null, undefined, ''].includes(item[key as keyof PageBannerItemType] as any)) {
            message.error('请先完善已有信息')
            return;
          }
        }
      }
    }

    props.onChange && props.onChange([...props.list, {
      banner_src: '',
      banner_link_type: 2,
      banner_link: null,
    }])
  }
  const onDelete = (index: number) => {
    const list = props.list
    list.splice(index, 1)
    props.onChange && props.onChange(list)
  }
  const onChange = (index: number, value: PageBannerItemType) => {
    const list = props.list
    list.splice(index, 1, value)
    props.onChange && props.onChange(list)
  }
  return (
    <div className={styles['page-banner']}>
      {props.list.map((item: PageBannerItemType, index: number) => (
        <PageBannerItem
          key={index}
          size={props.size}
          value={item}
          index={index}
          onChange={onChange}
          onDelete={onDelete}
        />
      ))}
      <Space className={styles['add-btn']} onClick={add}>
        <PlusOutlined />
        添加
      </Space>
    </div>
  )
}

export default PageBanner
