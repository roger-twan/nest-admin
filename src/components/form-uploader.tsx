import { useEffect, useState } from 'react'
import { Form, Upload, UploadFile} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import './form-uploader.scss'
import { UploadListType } from 'antd/es/upload/interface'

type FormUploaderProps = {
  defaultValue?: Array<any>,
  name: string
  label?: string
  labelWidth?: number
  size?: number[],
  max?: number,
  type?: 'image' | 'video'
  required?: boolean
}

function FormUploader(props: FormUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const {
    name,
    label = '',
    labelWidth = 100,
    size = [100, 100],
    max = 1,
    type = 'image',
    required = false
  } = props
  const tips = type === 'image' ? {
    errorMsg: '请上传图片',
    uploadTxt: '上传图片',
    mine: 'image/png, image/jpeg, image/jpg',
    des: `${size[0]} x ${size[1]}px`,
    listType: 'picture-card'
  } : {
    errorMsg: '请上传视频',
    uploadTxt: '上传视频',
    mine: 'video/mp4',
    des: `格式: MP4`,
    listType: 'text'
  }

  useEffect(() => {
    setFileList(props.defaultValue || [])
  }, [props.defaultValue])

  const onPreview = async (file: UploadFile) => {
    const isImage = type === 'image';
    let src = file.url as string;
    if (!src) {
      if (isImage) {
        src = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as Blob);
          reader.onload = () => resolve(reader.result as string);
        });
      } else {
        return;
      }
    }

    const elem = document.createElement(isImage ? 'img' : 'video') as HTMLVideoElement;
    elem.src = src;
    elem.controls = true;
    const newWindow = window.open(src);
    newWindow?.document.write(elem.outerHTML);
  }

  return (
    <Form.Item
      label={label}
      name={name}
      valuePropName="fileList"
      getValueFromEvent={(e: any) => Array.isArray(e) ? e : e && e.fileList}
      rules={[{required: required, message: tips.errorMsg}]}
      labelCol={{style: {width: labelWidth}}}
    >
      <Upload
        className={`form-uploader ${fileList.length >= max ? 'limit' : ''}`}
        listType={tips.listType as UploadListType}
        accept={tips.mine}
        fileList={fileList}
        maxCount={max}
        beforeUpload={() => false}
        onPreview={onPreview}
        onChange={e => setFileList(e.fileList)}
      >
        <button style={{ border: 0, background: 'none' }} type="button">
          <PlusOutlined />
          <div style={{ marginTop: 8 }}>{tips.uploadTxt}</div>
          {size && <span style={{ fontSize: 12, color: 'gray' }}>{tips.des}</span>}
        </button>
      </Upload>
    </Form.Item>
  )
}

export default FormUploader
