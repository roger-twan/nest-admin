import { Button, Input, InputRef, Spin, Tag, message } from 'antd'
import { useEffect, useRef, useState } from 'react'
import useSWR, { mutate } from 'swr'
import styles from './label.module.scss'
import PlusOutlined from '@ant-design/icons/PlusOutlined'
import useSWRMutation from 'swr/mutation'
import { postFetcher } from '@/utils/http'

interface Label {
  label_id: number
  label_category_id: number
  label_name: string
}

function LabelManagePage() {
  const [saving, setSaving] = useState(false)
  const [inputVisibleId, setInputVisibleId] = useState(0)
  const [inputValue, setInputValue] = useState('')
  const [deletedLabelIds, setDeletedLabelIds] = useState<number[]>([])
  const [labelList, setLabelList] = useState<Label[]>([])
  const {data: categoryData, isLoading: isCategoryLoading} = useSWR('/api/label_category/list')
  const {data: labelData, isLoading: isLabelLoading} = useSWR('/api/label/list')
  const { trigger: triggerUpdate } = useSWRMutation('/api/label/update', postFetcher)
  const inputRef = useRef<InputRef>(null);

  useEffect(() => {
    if (inputVisibleId > 0) {
      inputRef.current?.focus();
    }
  }, [inputVisibleId]);

  useEffect(() => {
    setLabelList(labelData?.list || [])
  }, [labelData])

  const handleInputConfirm = () => {
    if (inputValue) {
      const isTagExit = labelList.filter((label: any) => label.label_category_id === inputVisibleId).map((label: any) => label.label_name).includes(inputValue)

      if (!isTagExit) {
        setLabelList([...labelList, {
          label_id: 0,
          label_category_id: inputVisibleId,
          label_name: inputValue
        }]);
      }
    }
    setInputVisibleId(0);
    setInputValue('');
  };

  const handleClose = (label: Label) => {
    console.log(label.label_id)
    if (label.label_id) {
      setDeletedLabelIds([...deletedLabelIds, label.label_id])
    }
  };

  const save = async () => {
    const addedLabels = labelList.filter((label: any) => label.label_id === 0).map((label: any) => {
      return {
        label_category_id: label.label_category_id,
        label_name: label.label_name
      }
    })

    if (!addedLabels.length && !deletedLabelIds.length) {
      message.error('无修改项')
      return
    }

    try {
      setSaving(true)
      const result = await triggerUpdate({
        add: addedLabels,
        delete: deletedLabelIds
      })

      result.success ? message.success('保存成功') : message.error(result.message)
      mutate('/api/label/list')
      setDeletedLabelIds([])
      setSaving(false)
    } catch (error: any) {
      message.error(error.toString());
      setSaving(false)
    }
  }

  return (
    <Spin spinning={isCategoryLoading || isLabelLoading}>
      <div className="page">
      <div>
        {
          categoryData?.list?.map((category: any) => {
            return (<div className={styles['category-item']} key={category.label_category_id}>
              <p className={styles['category-title']}>{category.label_category_name}</p>
              {
                labelList.filter((label: any) => label.label_category_id === category.label_category_id).map((label: any) => {
                  return <Tag
                    className={styles['label-item']}
                    key={label.label_id}
                    closable
                    onClose={() => handleClose(label)}>{label.label_name}</Tag>
                })
              }
              {category.label_category_id === inputVisibleId ? (
                <Input
                  ref={inputRef}
                  type="text"
                  className={styles['tag-input']}
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                />
              ) : (
                <Tag
                  className={`${styles['label-item']} ${styles['add-tag']}`}
                  icon={<PlusOutlined />}
                  onClick={() => setInputVisibleId(category.label_category_id)}
                >
                  新增
                </Tag>
              )}
            </div>)
          })
        }
      </div>
      <Button
        type="primary"
        htmlType="submit"
        loading={saving}
        onClick={save}>
        保存
      </Button>
      </div>
    </Spin>
  )
}

export default LabelManagePage
