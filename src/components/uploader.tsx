import { useEffect, useState } from 'react'
import { Upload, UploadFile} from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import styles from './uploader.module.scss'
import useSWRMutation from 'swr/mutation'
import { postFetcher } from '@/utils/http'

type UploaderProps = {
  size?: number[],
  max?: number,
  value: string,
  onUploaded?: (value: string) => void
}

function Uploader(props: UploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const MAX = props.max || 1
  const size = props.size || [400, 400]
  const { trigger: triggerUpload } = useSWRMutation('/api/file/upload_image', postFetcher)

  useEffect(() => {
    if (props.value) {
      setFileList([{
        uid: 'id',
        status: 'done',
        name: 'image',
        url: props.value,
      }])
    }
  }, [props.value])

  const upload = async (file: UploadFile) => {
    setFileList([{
      ...file,
      status: 'uploading'
    }])

    const formData = new FormData();
    formData.append('file', file.originFileObj as Blob);
    formData.append('purpose', 'page-navigation')
    const result = await triggerUpload({
      _data: formData,
      _headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (result.success) {
      props.onUploaded && props.onUploaded(result.url)
    }
  }

  const onRemove = () => {
    setFileList([])
    props.onUploaded && props.onUploaded('')
  }

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj as Blob);
        reader.onload = () => resolve(reader.result as string);
      });
    }

    const elem = document.createElement('img');
    elem.src = src;
    const newWindow = window.open(src);
    newWindow?.document.write(elem.outerHTML);
  }

  return (
    <Upload
      className={`${styles['uploader']} ${fileList.length >= MAX ? 'upload-limit' : ''}`}
      listType='picture-card'
      accept='image/png, image/jpeg, image/jpg'
      fileList={fileList}
      maxCount={MAX}
      beforeUpload={() => false}
      onPreview={onPreview}
      onRemove={onRemove}
      onChange={({ fileList: newFileList }) => upload(newFileList[0])}
      style={{ margin: 0 }}
    >
      <button style={{ border: 0, background: 'none' }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>请上传图片</div>
        {size && <span style={{ fontSize: 12, color: 'gray' }}>{size[0]} x {size[1]}px</span>}
      </button>
    </Upload>
  )
}

export default Uploader
