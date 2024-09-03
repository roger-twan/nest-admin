import { Button, Form, Input, Radio, Select, Spin, message } from 'antd'
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const LABEL_WIDTH = 110

function MenuEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [saving, setSaving] = useState(false)
  const [isSpinning, setIsSpinning] = useState(!!id)
  const {data: pageData} = useSWR(`/api/page/simple_list`);
  const { trigger: triggerAdd } = useSWRMutation('/api/menu/add', postFetcher)
  const { trigger: triggerUpdate } = useSWRMutation('/api/menu/update', postFetcher)
  const { data } = useSWR(id ? `/api/menu/detail?id=${id}` : null)
  const [form] = Form.useForm();
  const [linkType, setLinkType] = useState<number>(2);

  useEffect(() => {
    if (data && data.success) {
      setFormValues(data.data)
      isSpinning && setIsSpinning(false)
    }
  }, [data]);

  useEffect(() => {
    form.setFieldValue('menu_link_type', linkType)
  }, [linkType]);

  const setFormValues = (data: any) => {
    let { menu_name, menu_link_type, menu_link_id } = data
    menu_link_id = menu_link_type === 2 ? Number(menu_link_id) : menu_link_id;
    setLinkType(menu_link_type)
    form.setFieldsValue({
      menu_name: menu_name || '',
      menu_link_type: menu_link_type || 1,
      menu_link_id: menu_link_id,
    })
  }

  const onTypeChange = (e: any) => {
    setLinkType(e.target.value)
    form.setFieldValue('menu_link_id', null)
  }

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const { menu_name, menu_link_type, menu_link_id } = values;

      if (id) {
        // 编辑
        const result = await triggerUpdate({
          menu_id: id,
          menu_name,
          menu_link_type,
          menu_link_id,
        })
        if (result.success) {
          message.success('编辑成功');
          navigate('/home-management/menu');
        } else {
          message.error(result.message);
        }
      } else {
        // 新增
        const result = await triggerAdd({
          menu_name,
          menu_link_type,
          menu_link_id,
        })
        if (result.success) {
          message.success('添加成功');
          navigate('/home-management/menu');
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
          label="菜单名称"
          name="menu_name"
          rules={[{ required: true, message: '请输入菜单名称!' }]}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="菜单链接类型"
          name="menu_link_type"
          required
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Radio.Group onChange={onTypeChange}>
            <Radio value={1}>官网链接</Radio>
            <Radio value={2}>页面</Radio>
          </Radio.Group>
        </Form.Item>

        {linkType === 1 && (
          <Form.Item
            label="链接"
            name="menu_link_id"
            rules={[{ required: true, message: '请输入链接!' }]}
            labelCol={{ style: { width: LABEL_WIDTH } }}
          >
            <Input placeholder='请输入链接' allowClear />
          </Form.Item>
        )}
        
        {linkType === 2 && (
          <Form.Item
            label="页面"
            name="menu_link_id"
            rules={[{ required: true, message: '请选择页面!' }]}
            labelCol={{ style: { width: LABEL_WIDTH } }}
          >
            <Select placeholder='请选择页面' options={pageData?.list.map((page: any) => ({ value: page.page_id, label: page.page_title }))}>
            </Select>
          </Form.Item>
        )}

        <Form.Item label=" " colon={false} labelCol={{ style: { width: LABEL_WIDTH } }}>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存
          </Button>
        </Form.Item>
      </Form>
      </div>
    </Spin>
  )
}

export default MenuEditPage
