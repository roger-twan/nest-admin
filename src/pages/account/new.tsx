import { postFetcher } from '@/utils/http';
import { PWD_REG } from '@/utils/regexp';
import { Button, Form, Input, Select, Spin, message, } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';

const LABEL_WIDTH = 80
function AccountEditPage() {
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [saving, setSaving] = useState(false)
  const [page] = useState(1);
  const [pageSize] = useState(100);
  const {data: companyData} = useSWR(`/api/company/simple_list?page=${page}&page_size=${pageSize}`);
  const { trigger: triggerAdd } = useSWRMutation('/api/account/add', postFetcher)

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const {
        account_email,
        account_password,
        account_companies,
      } = values;

      const result = await triggerAdd({
        account_email,
        account_password,
        account_company_ids: account_companies ? account_companies.join(',') : '',
      })
      if (result.success) {
        message.success('添加成功');
        navigate('/account-management');
      } else {
        message.error(result.message)
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
      >
        <Form.Item
          label="邮箱"
          name="account_email"
          rules={[
            { required: true, message: '请输入邮箱!' },
            { type: 'email', message: '请输入正确的邮箱格式' }
          ]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="密码"
          name="account_password"
          rules={[
            { required: true, message: '请输入密码!' },
            { pattern: PWD_REG, message: '至少8位,包含数字,大小写字母和特殊字符'}
          ]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.Password
            placeholder="至少8位,包含数字,大小写字母和特殊字符"
            visibilityToggle={{ visible: passwordVisible, onVisibleChange: setPasswordVisible }}
            autoComplete="account_password"
          />
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

export default AccountEditPage
