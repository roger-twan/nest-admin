import { postFetcher } from '@/utils/http';
import { Button, Form, Input, Select, Spin, message, } from 'antd'
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWR, { mutate } from 'swr';
import useSWRMutation from 'swr/mutation';

const LABEL_WIDTH = 80
function AccountManageCompanyPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const email = searchParams.get('email')
  const companyIds = searchParams.get('companyIds')
  const [saving, setSaving] = useState(false)
  const [page] = useState(1);
  const [pageSize] = useState(100);
  const {data: companyData} = useSWR(`/api/company/simple_list?page=${page}&page_size=${pageSize}`);
  const { trigger: triggerUpdateCompany } = useSWRMutation('/api/account/update_company', postFetcher)
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      account_email: email,
      account_companies: companyIds ? companyIds.split(',').map(Number) : [],
    })
  }, [form])

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const result = await triggerUpdateCompany({
        account_id: id,
        account_company_ids: values.account_companies.join(','),
      })
      if (result.success) {
        message.success('编辑成功');
        mutate(`/api/company/simple_list?page=${page}&page_size=${pageSize}`);
        navigate('/account-management');
      } else {
        message.error(result.message);
      }

      setSaving(false)
    } catch (error: any) {
      message.error(error.toString());
      setSaving(false)
    }
  };

  return (
    <Spin spinning={false}>
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
            label="邮箱"
            name="account_email"
            labelCol={{ style: { width: LABEL_WIDTH } }}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="管理权限"
            name="account_companies"
            labelCol={{ style: { width: LABEL_WIDTH } }}
          >
            <Select
              mode="multiple"
              options={companyData?.list || []}
              fieldNames={{ label: 'company_name', value: 'company_id' }}
              allowClear
            />
          </Form.Item>

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

export default AccountManageCompanyPage
