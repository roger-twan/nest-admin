import { Button, Form, Input, Spin, message } from 'antd'
import FormUploader from '@/components/form-uploader'
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const LABEL_WIDTH = 80

function BannerEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [defaultBannerList, setDefaultBannerList] = useState<any>([])
  const [saving, setSaving] = useState(false)
  const [isSpinning, setIsSpinning] = useState(!!id)
  const { trigger: triggerUpload } = useSWRMutation('/api/file/upload_image', postFetcher)
  const { trigger: triggerAdd } = useSWRMutation('/api/banner/add', postFetcher)
  const { trigger: triggerUpdate } = useSWRMutation('/api/banner/update', postFetcher)
  const { data } = useSWR(id ? `/api/banner/detail?id=${id}` : null)
  const [form] = Form.useForm();

  useEffect(() => {
    if (data && data.success) {
      setFormValues(data.data)
      isSpinning && setIsSpinning(false)
    }
  }, [data]);

  const setFormValues = (data: any) => {
    const { banner_title, banner_description, banner_link, banner_src } = data
    const banner: any = banner_src ? [{ url: banner_src }] : [];
    form.setFieldsValue({
      banner_title: banner_title || '',
      banner_description: banner_description || '',
      banner_link: banner_link || '',
      banner_src: banner
    })
    setDefaultBannerList(banner)
  }

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const file = values.banner_src[0];
      const isNewFile = !file.url;
      let url = '';

      if (isNewFile) {
        const result = await uploadBanner(file.originFileObj)
        if (result.success) {
          url = result.url
        } else {
          message.error(result.message)
          setSaving(false)
          return
        }
      } else {
        url = file.url
      }

      const { banner_title, banner_description, banner_link } = values;

      if (id) {
        // 编辑
        const result = await triggerUpdate({
          banner_id: id,
          banner_title,
          banner_description,
          banner_link,
          banner_src: url
        })
        if (result.success) {
          message.success('编辑成功');
          navigate('/home-management/banner');
        } else {
          message.error(result.message);
        }
      } else {
        // 新增
        const result = await triggerAdd({
          banner_title,
          banner_description,
          banner_link,
          banner_src: url
        })
        if (result.success) {
          message.success('添加成功');
          navigate('/home-management/banner');
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

  const uploadBanner = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'banner')
    const result = await triggerUpload({
      _data: formData,
      _headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return result
  }

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
        <FormUploader
          name="banner_src"
          label="Banner图"
          labelWidth={LABEL_WIDTH}
          size={[750, 830]}
          max={1}
          defaultValue={defaultBannerList}
          required
        />

        <Form.Item
          label="标题"
          name="banner_title"
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.TextArea allowClear />
        </Form.Item>

        <Form.Item
          label="描述"
          name="banner_description"
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.TextArea allowClear />
        </Form.Item>

        <Form.Item
          label="跳转链接"
          name="banner_link"
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.TextArea allowClear />
        </Form.Item>

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

export default BannerEditPage
