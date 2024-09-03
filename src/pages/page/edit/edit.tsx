import { Button, Form, Input, Select, Spin, message } from 'antd'
import FormUploader from '@/components/form-uploader'
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import RichTextEditor from '@/components/rich-text-editor';
import styles from './edit.module.scss';
import PageBanner from './page-banner';
import { PageBannerItemType } from './page-banner-item';
import GuideImg from '@/assets/guide.png'

const LABEL_WIDTH = 80

function PageEditPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const [saving, setSaving] = useState(false)
  const [isSpinning, setIsSpinning] = useState(!!id)
  const { trigger: triggerUpload } = useSWRMutation('/api/file/upload_image', postFetcher)
  const { trigger: triggerAdd } = useSWRMutation('/api/page/add', postFetcher)
  const { trigger: triggerUpdate } = useSWRMutation('/api/page/update', postFetcher)
  const { data } = useSWR(id ? `/api/page/detail?id=${id}` : null)
  const { data: videoList } = useSWR('/api/video/list');
  const [ topNavList, setTopNavList ] = useState<PageBannerItemType[]>([])
  const [ bottomNavList, setBottomNavList ] = useState<PageBannerItemType[]>([])
  const [form] = Form.useForm();

  useEffect(() => {
    if (data && data.success) {
      setValues(data.data)
      isSpinning && setIsSpinning(false)
    }
  }, [data]);

  const setValues = (data: any) => {
    form.setFieldsValue({
      page_title: data.page_title || '',
      page_identifier: data.page_identifier || '',
      page_banners: data.page_banners ? data.page_banners.split(',').map((item: any) => ({url: item})) : [],
      page_banner_video_id: data.page_banner_video_id || null,
      page_rich_text: data.page_rich_text || '',
    })

    data.page_top_nav && setTopNavList(JSON.parse(data.page_top_nav))
    data.page_bottom_nav && setBottomNavList(JSON.parse(data.page_bottom_nav))
  }

  const uploadBanner = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'page-banner')
    const result = await triggerUpload({
      _data: formData,
      _headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return result
  }

  const onFinish = async (values: any) => {
    const data: any = {}
    data.page_title = values.page_title || ''
    data.page_identifier = values.page_identifier || ''
    data.page_rich_text = values.page_rich_text || ''

    // 页头视频
    if (values.page_banner_video_id) {
      const video = videoList?.list.find((item: any) => item.video_id === values.page_banner_video_id)
      data.page_banner_video_id = video?.video_id
      data.page_banner_video_post_src = video?.video_poster
      data.page_banner_video_src = video?.video_src
    } else {
      data.page_banner_video_id = ''
      data.page_banner_video_post_src = ''
      data.page_banner_video_src = ''
    }

    // 页头导航
    if (topNavList.length) {
      for (const item of topNavList) {
        for (let key in item) {
          if (item.hasOwnProperty(key)) {
            if ([null, undefined, ''].includes(item[key as keyof PageBannerItemType] as any)) {
              message.error('请完善二级导航信息')
              return;
            }
          }
        }
      }

      data.page_top_nav = JSON.stringify(topNavList)
    } else {
      data.page_top_nav = ''
    }

    // 底部营销
    if (bottomNavList.length) {
      for (const item of bottomNavList) {
        for (let key in item) {
          if (item.hasOwnProperty(key)) {
            if ([null, undefined, ''].includes(item[key as keyof PageBannerItemType] as any)) {
              message.error('请完善底部营销信息')
              return;
            }
          }
        }
      }

      data.page_bottom_nav = JSON.stringify(bottomNavList)
    } else {
      data.page_bottom_nav = ''
    }

    try {
      console.log(values.page_banners)
      setSaving(true)
      // 页头形象图
      if (values.page_banners && values.page_banners.length) {
        const list = [];
        for (const file of values.page_banners) {  
          if (!file.url) {
            const result = await uploadBanner(file.originFileObj)
            if (result.success) {
              list.push(result.url)
            } else {
              message.error(result.message)
              setSaving(false)
              return
            }
          } else {
            list.push(file.url)
          }
        }

        data.page_banners = list.join(',')
      } else {
        data.page_banners = ''
      }

      if (id) {
        // 编辑
        const result = await triggerUpdate(
          {
            page_id: id,
            ...data
          }
        )
        if (result.success) {
          message.success('编辑成功');
          navigate('/home-management/page');
        } else {
          message.error(result.message);
        }
      } else {
        // 新增
        const result = await triggerAdd(data)
        if (result.success) {
          message.success('添加成功');
          navigate('/home-management/page');
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
          xs: { span: 22 },
          sm: { span: 11},
        }}
        onFinish={onFinish}
        form={form}
        key={Date.now()}
      >
        <Form.Item
          label="页面标题"
          name="page_title"
          rules={
            [
              {
                required: true,
                message: '请输入页面标题'
              }
            ]
          }
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Input allowClear />
        </Form.Item>

        <Form.Item
          label="页面标识"
          name="page_identifier"
          labelCol={{ style: { width: LABEL_WIDTH } }}
          tooltip="页面特殊标识，不展示在页面; 一般不填写，如需填写请与开发沟通"
        >
          <Input placeholder="选填" allowClear />
        </Form.Item>

        <FormUploader
          name="page_banners"
          label="页头形象图"
          labelWidth={LABEL_WIDTH}
          size={[750, 420]}
          max={10}
        />

        <Form.Item
          label="页头视频"
          name="page_banner_video_id"
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <Select
            options={videoList?.list.map((item: any) => ({
              label: <><img className={styles['video-poster']} src={item.video_poster} />{item.video_title}</>,
              value: item.video_id
            }))}
            placeholder="选填"
            allowClear
          />
        </Form.Item>

        <Form.Item
          label="二级导航"
          key={Date.now()}
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <PageBanner
            key={Date.now()}
            size={[200, 64]}
            list={[...topNavList]}
            onChange={(value) => setTopNavList(value)}
          />
        </Form.Item>

        <RichTextEditor
          name="page_rich_text"
          label="页面内容"
          labelWidth={LABEL_WIDTH}
        />

        <Form.Item
          label="底部营销"
          name="page_bottom_nav"
          labelCol={{ style: { width: LABEL_WIDTH } }}
        >
          <PageBanner
            key={Date.now()}
            size={[400, 400]}
            list={[...bottomNavList]}
            onChange={(value) => setBottomNavList(value)}
          />
        </Form.Item>

        <Form.Item label=" " colon={false} labelCol={{ style: { width: LABEL_WIDTH } }}>
          <Button type="primary" htmlType="submit" loading={saving}>
            保存
          </Button>
        </Form.Item>
      </Form>

      <img className={styles['guide-img']} src={GuideImg} />  
      </div>
    </Spin>
  )
}

export default PageEditPage
