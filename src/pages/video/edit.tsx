import { Button, Form, Input, Spin, message } from 'antd'
import FormUploader from '@/components/form-uploader'
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

const LABEL_WIDTH = 80

function VideoEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [defaultPosterList, setDefaultPosterList] = useState<any>([])
  const [defaultVideoList, setDefaultVideoList] = useState<any>([])
  const [saving, setSaving] = useState(false)
  const [isSpinning, setIsSpinning] = useState(!!id)
  const [uploadText, setUploadText] = useState<string>('');
  const { trigger: triggerUploadImage } = useSWRMutation('/api/file/upload_image', postFetcher)
  const { trigger: triggerUploadVideo } = useSWRMutation('/api/file/upload_video', postFetcher)
  const { trigger: triggerAdd } = useSWRMutation('/api/video/add', postFetcher)
  const { trigger: triggerUpdate } = useSWRMutation('/api/video/update', postFetcher)
  const { data } = useSWR(id ? `/api/video/detail?id=${id}` : null)
  const [form] = Form.useForm();

  useEffect(() => {
    if (data && data.success) {
      setFormValues(data.data)
      isSpinning && setIsSpinning(false)
    }
  }, [data]);

  const setFormValues = (data: any) => {
    const { video_title, video_description, video_name, video_src, video_poster } = data
    const video: any = video_src ? [{ url: video_src, name: video_name }] : [];
    const poster: any = video_poster ? [{ url: data.video_poster }] : [];
    form.setFieldsValue({
      video_title: video_title || '',
      video_src: video,
      video_poster: poster,
      video_description: video_description || '',
    })
    setDefaultPosterList(poster)
    setDefaultVideoList(video)
  }

  const onFinish = async (values: any) => {
    setSaving(true)
    try {
      const [video_src, video_name] = await uploadFile(values.video_src[0], 'video');
      const [video_poster] = await uploadFile(values.video_poster[0], 'poster');
      const { video_title, video_description } = values;

      if (id) {
        // 编辑
        const result = await triggerUpdate({
          video_id: id,
          video_title,
          video_name,
          video_poster,
          video_description,
          video_src
        })
        if (result.success) {
          message.success('编辑成功');
          navigate('/home-management/video');
        } else {
          message.error(result.message);
        }
      } else {
        // 新增
        const result = await triggerAdd({
          video_title,
          video_name,
          video_poster,
          video_description,
          video_src
        })
        if (result.success) {
          message.success('添加成功');
          navigate('/home-management/video');
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

  const uploadFile = async (file: any, type: string): Promise<[string, string | undefined]> => {
    const isNewFile = !file.url;
    if (!isNewFile) {
      return [file.url!, undefined]
    }

    const formData = new FormData();
    formData.append('file', file.originFileObj);
    formData.append('purpose', 'video')
    const data = {
      _data: formData,
      _headers: {
        'Content-Type': 'multipart/form-data'
      },
      _timeout: 1000 * 60 * 5,
      _progress: (progressEvent: any) => {
        const percentComplete = progressEvent.loaded / progressEvent.total;
        let percent = parseInt((percentComplete * 100).toString());
        percent = percent > 99 ? 99 : percent
        setUploadText(type === 'video' ? `上传视频中(${percent}%)` : `上传封面中(${percent}%)`);
      }
    }
    try {
      setUploadText(type === 'video' ? '上传视频中(0%)' : '上传图片中(0%)');
      const result =
        type === 'video'
        ? await triggerUploadVideo(data)
        : await triggerUploadImage(data);

      if (result.success) {
        setUploadText('')
        return [result.url, file.name]
      } else {
        setUploadText('')
        throw new Error(result.message)
      }
    } catch (error: any) {
      setUploadText('')
      throw new Error(error.toString())
    }
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
        <Form.Item
          label="视频标题"
          name="video_title"  
          labelCol={{ style: { width: LABEL_WIDTH } }}
          rules={[{ required: true, message: '请输入视频标题' }]}
        >
          <Input allowClear />
        </Form.Item>

        <FormUploader
          name="video_src"
          label="视频"
          labelWidth={LABEL_WIDTH}
          size={[750, 420]}
          max={1}
          type='video'
          defaultValue={defaultVideoList}
          required
        />

        <FormUploader
          name="video_poster"
          label="视频封面"
          labelWidth={LABEL_WIDTH}
          size={[750, 420]}
          max={1}
          defaultValue={defaultPosterList}
          required
        />

        <Form.Item
          label="备注"
          name="video_description"
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input.TextArea allowClear />
        </Form.Item>

        <Form.Item label=" " colon={false} labelCol={{ style: { width: LABEL_WIDTH } }}>
          <Button type="primary" htmlType="submit" loading={saving}>
            {uploadText || '保存'}
          </Button>
        </Form.Item>
      </Form>
      </div>
    </Spin>
  )
}

export default VideoEditPage
