import useUserStore from '@/store/user';
import { postFetcher } from '@/utils/http';
import { PWD_REG } from '@/utils/regexp';
import { Button, Form, Input, Spin, message, } from 'antd'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSWRMutation from 'swr/mutation';

const LABEL_WIDTH = 100
function ResetPwdPage() {
  const navigate = useNavigate()
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false)
  const [firstPasswordVisible, setFirstPasswordVisible] = useState(false)
  const [secondPasswordVisible, setSecondPasswordVisible] = useState(false)
  const resetUser = useUserStore((state) => state.resetUser)
  const [saving, setSaving] = useState(false)
  
  const { trigger: triggerResetPwd } = useSWRMutation('/api/account/self_reset_password', postFetcher)
  const pswMsg = { pattern: PWD_REG, message: '至少8位,包含数字,大小写字母和特殊字符(~!@#$%^&*()_-+=)'}

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const result = await triggerResetPwd({
        old_password: values.current_password,
        new_password: values.first_password,
      })
      if (result.success) {
        message.success('密码重设成功');
        resetUser()
        navigate('/login')
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
      >

        <Form.Item
          label="当前密码"
          name="current_password"
          rules={[
            { required: true, message: '请输入当前密码!' },
            pswMsg
          ]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.Password
            placeholder="至少8位,包含数字,大小写字母和特殊字符"
            visibilityToggle={{ visible: currentPasswordVisible, onVisibleChange: setCurrentPasswordVisible }}
          />
        </Form.Item>

        <Form.Item
          label="新密码"
          name="first_password"
          rules={[
            { required: true, message: '请输入新密码!' },
            pswMsg
          ]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.Password
            placeholder="至少8位,包含数字,大小写字母和特殊字符"
            visibilityToggle={{ visible: firstPasswordVisible, onVisibleChange: setFirstPasswordVisible }}
          />
        </Form.Item>

        <Form.Item
          label="确认新密码"
          name="second_password"
          rules={[
            { required: true, message: '请再次输入新密码!' },
            pswMsg,
            ({ getFieldValue }) => ({
              validator(_, value) {
                console.log()
                if (getFieldValue('first_password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致!'));
              },
            })
          ]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.Password
            placeholder="至少8位,包含数字,大小写字母和特殊字符"
            visibilityToggle={{ visible: secondPasswordVisible, onVisibleChange: setSecondPasswordVisible }}
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

export default ResetPwdPage
