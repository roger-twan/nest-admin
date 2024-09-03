import { postFetcher } from '@/utils/http';
import { PWD_REG } from '@/utils/regexp';
import { Button, Form, Input, Spin, message, } from 'antd'
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useSWRMutation from 'swr/mutation';

const LABEL_WIDTH = 80
function AccountResetPwdPage() {
  const navigate = useNavigate()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const email = searchParams.get('email')
  const [saving, setSaving] = useState(false)
  const { trigger: triggerUpdatePwd } = useSWRMutation('/api/account/reset_password', postFetcher)
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      account_email: email,
    })
  }, [form])

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const result = await triggerUpdatePwd({
        account_id: id,
        account_password: values.account_password,
      })
      if (result.success) {
        message.success('密码重设成功');
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
          label="密码"
          name="account_password"
          rules={[
            { required: true, message: '请输入密码!' },
            { pattern: PWD_REG, message: '至少8位,包含数字,大小写字母和特殊字符(~!@#$%^&*()_-+=)'}
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

export default AccountResetPwdPage
