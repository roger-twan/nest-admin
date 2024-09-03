import { Checkbox, Input, InputRef, Radio, Spin, } from 'antd'
import styles from './label.module.scss'
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

interface LabelModuleProps {
  ids: number[],
  salary?: string,
  onChange?: (ids: number | CheckboxValueType[]) => void
  onSalaryChange?: (salary: string) => void
}

function LabelModule(props: LabelModuleProps) {
  const { data: labelCategoryList, isLoading: l1 } = useSWR('/api/label_category/list');
  const { data: labelList, isLoading: l2 } = useSWR('/api/label/list');
  const [value, setValue] = useState<number[]>([]);
  const [salaryValue, setSalaryValue] = useState<string>('');
  const salaryInput = useRef<InputRef>(null);

  const getOptions = (categoryId: number) => {
    return labelList?.list.filter((label: any) => label.label_category_id === categoryId)
  }

  const getRadioDefaultValue = (categoryId: number) => {
    const ids = value.length ? value : props.ids
    const selected = getOptions(categoryId).filter((label: any) => ids.includes(label.label_id))
    return selected && selected[0] ? selected[0].label_id : undefined
  }

  const getCheckboxDefaultValue = (categoryId: number) => {
    const ids = value.length ? value : props.ids
    const selected = getOptions(categoryId).filter((label: any) => ids.includes(label.label_id))
    return selected ? selected.map((label: any) => label.label_id) : []
  }

  const onChange = (
    ids: number | CheckboxValueType[],
    type: number,
    categoryId: number
  ) => {
    const curCategoryAllIds = labelList?.list.filter((label: any) => label.label_category_id === categoryId).map((label: any) => label.label_id);
    let result = value.filter((id: number) => !curCategoryAllIds.includes(id));
    if (type === 1) {
      result.push(ids as number)
    } else if (type === 2) {
      result = [...result, ...ids as number[]]
    }
    setValue(result);
    props.onChange && props.onChange(result)
  }

  const onSalaryInputChange = (e: any) => {
    setTimeout(() => {
      salaryInput.current!.focus({
        cursor: 'end',
      });
    }, 0)
    setSalaryValue(e.target.value);
    props.onSalaryChange && props.onSalaryChange(e.target.value)
  }

  useEffect(() => {
    if (labelList && labelList.success) {
      setValue(props.ids)
    }
  }, [labelList, props.ids])

  useEffect(() => {
    if (props.salary) {
      setSalaryValue(props.salary);
    }
  }, [props.salary])

  return (
    <Spin spinning={l1 || l2}>
      <div className={styles['label-module']}>
        {labelCategoryList && labelList && labelCategoryList.list.map((category: any) => {
          return (
            <div className={styles['label-item']} key={category.label_category_id}>
              <p className={styles['label-title']}>{category.label_category_name}</p>
              {category.label_category_type === 1 ?
                <Radio.Group
                  options={getOptions(category.label_category_id)?.map((label: any) => ({
                    label: label.label_name === '自定义'?
                      <Input
                        value={salaryValue}
                        ref={salaryInput}
                        className={styles['salary-input']}
                        placeholder="自定义"
                        size="small"
                        onChange={onSalaryInputChange}
                      />
                      : label.label_name,
                    value: label.label_id
                  }))}
                  key={String(Date.now())}
                  defaultValue={getRadioDefaultValue(category.label_category_id)}
                  onChange={(e) => onChange(e.target.value, category.label_category_type, category.label_category_id)}
                />
                :
                <Checkbox.Group
                  options={getOptions(category.label_category_id)?.map((label: any) => ({
                    label: label.label_name,
                    value: label.label_id
                  }))}
                  key={String(Date.now())}
                  defaultValue={getCheckboxDefaultValue(category.label_category_id)}
                  onChange={(e) => onChange(e, category.label_category_type, category.label_category_id)}
                />
              }
            </div>
          )
        })}
      </div>
    </Spin>
  )
}

export default LabelModule
