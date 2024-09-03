import RichTextEditor from '@/components/rich-text-editor'
import { postFetcher } from '@/utils/http'
import { Button, Form, Input, Spin, message, } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useSWR from 'swr'
import useSWRMutation from 'swr/mutation'

const LABEL_WIDTH = 100
function CompanyEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [saving, setSaving] = useState(false)
  const [isSpinning, setIsSpinning] = useState(!!id)
  const { trigger: triggerAdd } = useSWRMutation('/api/company/add', postFetcher)
  const { trigger: triggerUpdate } = useSWRMutation('/api/company/update', postFetcher)
  const { data } = useSWR(id ? `/api/company/detail?id=${id}` : null)
  const [form] = Form.useForm();

  useEffect(() => {
    if (data && data.success) {
      setFormValues(data.data)
      isSpinning && setIsSpinning(false)
    }
  }, [data]);

  const setFormValues = (data: any) => {
    const {
      company_name,
      company_intro,
      company_address,
      company_coordinate,
      company_description,
      company_policy
    } = data
    const coordinates = company_coordinate?.split(',')
    form.setFieldsValue({
      company_name: company_name || '',
      company_intro: company_intro || '',
      company_address: company_address || '',
      company_longitude: coordinates ? coordinates[0] : '',
      company_latitude: coordinates ? coordinates[1] : '',
      company_description: company_description || '',
      company_policy: company_policy || '',
    })
  }

  const onFinish = async (values: any) => {
    const {
      company_name,
      company_intro,
      company_address,
      company_longitude,
      company_latitude,
      company_description,
      company_policy
    } = values;
    setSaving(true)
    try {
      if (id) {
        // 编辑
        const result = await triggerUpdate({
          company_id: id,
          company_name,
          company_intro,
          company_address,
          company_coordinate: `${company_longitude},${company_latitude}`,
          company_description,
          company_policy
        })
        if (result.success) {
          message.success('编辑成功');
          navigate('/company-management');
        } else {
          message.error(result.message);
        }
      } else {
        // 新增
        const result = await triggerAdd({
          company_name,
          company_intro,
          company_address,
          company_coordinate: `${company_longitude},${company_latitude}`,
          company_description,
          company_policy
        })
        if (result.success) {
          message.success('添加成功');
          navigate('/company-management');
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

  return (
    <Spin spinning={isSpinning}>
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
          label="公司名称"
          name="company_name"
          rules={[{ required: true, message: '请输入公司名称!' }]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="公司简介"
          name="company_intro"
          rules={[{ required: true, message: '请输入公司简介!' }]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="公司地址"
          labelCol={{ style: { width: LABEL_WIDTH } }}
          style={{ marginBottom: 0 }}
          tooltip="经纬度查询链接：https://lbs.qq.com/getPoint/"
          required
        >
          <Form.Item
            name="company_address"
            rules={[{ required: true, message: '请输入公司地址!' }]}
          >
            <Input allowClear placeholder="地址" />
          </Form.Item>
      
          <Form.Item
            name="company_latitude"
            rules={[{ required: true, message: '请输入纬度!' }]}
            style={{display: 'inline-block', width: '48%'}}
          >
            <Input allowClear placeholder="纬度" />
          </Form.Item>

          <Form.Item
            name="company_longitude"
            rules={[{ required: true, message: '请输入经度!' }]}
            style={{display: 'inline-block', width: '48%', marginLeft: '4%'}}
          >
            <Input allowClear placeholder="经度" />
          </Form.Item>
        </Form.Item>

        <RichTextEditor
          name="company_description"
          label="公司介绍"
          labelWidth={LABEL_WIDTH}
          required
        />

        <RichTextEditor
          name="company_policy"
          label="求职隐私政策"
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

export default CompanyEditPage
