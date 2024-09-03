import { Form, message } from 'antd';
import { useEffect, useRef, useState } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import './editor.scss'
import useSWRMutation from 'swr/mutation';
import { postFetcher } from '@/utils/http';

type RichTextEditorProps = {
  name: string
  label: string
  labelWidth: number,
  required?: boolean
}

const fontSize = Quill.import('attributors/style/size');
fontSize.whitelist = ['10px', '12px', '14px', '16px', '18px', '20px'];
Quill.register(fontSize, true);

const colorList = ['#f15507', '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466']

const toolbar = [
  [{ 'size': fontSize.whitelist}],
  ['blockquote', 'image', 'link'],
  [{ 'indent': '-1'}, { 'indent': '+1' }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
  [{ 'color': colorList }, { 'background': colorList }],
  [{ 'align': [] }],
]

function RichTextEditor(props: RichTextEditorProps) {
  const [value, setValue] = useState('')
  const [readOnly, setReadOnly] = useState(true);
  const { name, label, labelWidth, required = false } = props
  const { trigger: triggerUpload } = useSWRMutation('/api/file/upload_image', postFetcher)
  const quill = useRef<ReactQuill>(null);

  const uploadBanner = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('purpose', 'richtext')
    const result = await triggerUpload({
      _data: formData,
      _headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return result
  }

  useEffect(() => {
    setReadOnly(false);
    const editor = quill?.current?.getEditor()
    const toolbar = editor?.getModule('toolbar')
    editor?.format('size', '16px')

    toolbar.addHandler('image', () => {
      const input = document.createElement('input')
      input.setAttribute('type', 'file')
      input.setAttribute('accept', 'image/*')
      input.click()
      input.onchange = async () => {
        if (!input.files || !input?.files?.length || !input?.files?.[0])
          return

        const file = input.files[0]

        try {
          uploadBanner
          const result = await uploadBanner(file)

          if (result.success) {
            const range = editor?.getSelection(true)
            editor?.insertEmbed(range!.index, 'image', result.url)
          } else {
            message.error(result.message)
          }
        } catch (err) {
          message.error('上传图片失败，请重试!')
        }
      }
    })
  }, [quill])

  return (
    <Form.Item
      label={label}
      name={name}
      getValueFromEvent={(e: any) => (e === '<p><br></p>') ? '' : e}
      rules={[{required: required, message: `请输入${label}!`}]}
      labelCol={{style: {width: labelWidth}}}
    >
      <ReactQuill
        ref={quill}
        value={value}
        modules={{
          toolbar: toolbar,
        }}
        readOnly={readOnly}
        onChange={setValue}
      />
    </Form.Item>
  )
}

export default RichTextEditor
