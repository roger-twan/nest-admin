import { Button, Form, Input, Select, Spin, message, } from 'antd'
import RichTextEditor from '@/components/rich-text-editor'
import { postFetcher } from '@/utils/http'
import { useEffect, useState } from 'react'
import useSWRMutation from 'swr/mutation'
import { useNavigate, useSearchParams } from 'react-router-dom'
import LabelModule from './label.module'
import useSWR from 'swr'

const LABEL_WIDTH = 80
function JobEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [saving, setSaving] = useState(false)
  const [selectedLabelIds, setSelectedLabelIds] = useState<number[]>([])
  const [salary, setSalary] = useState('')
  const { trigger: triggerAdd } = useSWRMutation('/api/job/add', postFetcher)
  const { trigger: triggerUpdate } = useSWRMutation('/api/job/update', postFetcher)
  const { data: jobDetail, isLoading: l1 } = useSWR(id ? `/api/job/detail?id=${id}` : null);
  const { data: companyList, isLoading: l2 } = useSWR('/api/company/list?page=1&page_size=100');
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const { job_title, job_company_id, job_department, job_detail } = values
    
    setSaving(true)
    try {
      if (id) {
        // 编辑
        const result = await triggerUpdate({
          job_id: id,
          job_title,
          job_company_id,
          job_department,
          job_label_ids: selectedLabelIds.join(','),
          job_custom_salary: salary,
          job_detail,
        })
        if (result.success) {
          message.success('编辑成功');
          navigate('/job-management');
        } else {
          message.error(result.message);
        }
      } else {
        // 新增
        const result = await triggerAdd({
          job_title,
          job_company_id,
          job_department,
          job_label_ids: selectedLabelIds.join(','),
          job_custom_salary: salary,
          job_detail,
        })
        if (result.success) {
          message.success('添加成功');
          navigate('/job-management');
        } else {
          message.error(result.message)
        }
      }

      setSaving(false)
    } catch (error: any) {
      message.error(error.toString());
      setSaving(false)
    }
  };

  const setFormValues = (data?: any) => {
    form.setFieldsValue({
      job_title: data?.job_title || '',
      job_company_id: data?.job_company_id || '',
      job_department: data?.job_department || '',
      job_detail: data?.job_detail || `
        <p><strong style="font-size: 16px;">职位职责</strong></p>
        <p><span style="font-size: 16px;">1.</span></p>
        <p><span style="font-size: 16px;">2.</span>
        </p><p><br></p>
        <p><strong style="font-size: 16px;">职位要求</strong></p>
        <p><span style="font-size: 16px;">1.</span></p>
        <p><span style="font-size: 16px;">2.</span></p>
      `
    })
  }

  useEffect(() => {
    if (jobDetail && jobDetail.success) {
      setFormValues(jobDetail.data)
      setSelectedLabelIds(jobDetail.data.job_label_ids.split(',').map((item: string) => Number(item)))
      setSalary(jobDetail.data.job_custom_salary)
    } else {
      setFormValues()
    }
  }, [form, jobDetail]);

  return (
    <Spin spinning={l1 || l2}>
      <div className="page">
      <Form
        wrapperCol={{
          xs: { span: 20 },
          sm: { span: 11},
        }}
        onFinish={onFinish}
        form={form}
      >
        <Form.Item
          label="职位"
          name="job_title"
          labelCol={{ style: { width: LABEL_WIDTH } }}
          rules={[{ required: true, message: '请输入职位名称' }]}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="分公司"
          name="job_company_id"
          labelCol={{ style: { width: LABEL_WIDTH } }}
          rules={[{ required: true, message: '请选择分公司!' }]}
        >
          <Select
            options={companyList?.list}
            fieldNames={{
              label: 'company_name',
              value: 'company_id'
            }}
          />
        </Form.Item>

        <Form.Item
          label="部门"
          name="job_department"
          labelCol={{ style: { width: LABEL_WIDTH } }}
          rules={[{ required: true, message: '请输入部门' }]}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="职位标签"
          labelCol={{ style: { width: LABEL_WIDTH } }}
          rules={[{ required: true, message: '请选择职位标签!' }]}
        >
          <LabelModule
            salary={jobDetail?.data?.job_custom_salary || ''}
            ids={selectedLabelIds}
            onChange={(ids) => setSelectedLabelIds(ids as number[])}
            onSalaryChange={(salary) => setSalary(salary)}
          />
        </Form.Item>
  
        <RichTextEditor
          name="job_detail"
          label="职位详情"
          labelWidth={LABEL_WIDTH}
          required
        />

        <Form.Item
          label=" "
          colon={false}
          labelCol={{ style: { width: LABEL_WIDTH }}}
        >
          <Button type="primary" htmlType="submit" loading={saving}>
            保存
          </Button>
        </Form.Item>
      </Form>
      </div>
    </Spin>
  )
}

export default JobEditPage
