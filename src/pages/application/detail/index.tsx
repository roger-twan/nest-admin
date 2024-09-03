import { Badge, Button, Form, Radio, Tag, Spin, message } from 'antd'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import styles from './index.module.scss'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getFetcher, postFetcher } from '@/utils/http'
import useSWRMutation from 'swr/mutation'
import useSWR from 'swr'
import { format } from 'date-fns'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url,
).toString();

const LABEL_WIDTH = 80
function JobDetailPage() {
  const [numPages, setNumPages] = useState(1);
  const [searchParams] = useSearchParams()
  const [resumeBlob, setResumeBlob] = useState('');
  const [resumeExt, setResumeExt] = useState('');
  const [status, setStatus] = useState(0);
  const [updating, setUpdating] = useState(false);
  const [openid, setOpenid] = useState('');
  const id = searchParams.get('id')
  const { data, isLoading } = useSWR( id ? `/api/application/detail?id=${id}` : null)
  const { data: applicationList } = useSWR( id ? `/api/application/simple_list?openid=${openid}` : null)
  const { data: companyList } = useSWR('/api/company/list?page=1&page_size=100');
  const { trigger: triggerUpdate } = useSWRMutation('/api/application/update', postFetcher);

  const statusOptions = [
    { label: <Badge color="blue" text="有意向" />, value: 2 },
    { label: <Badge color="yellow" text="邀面试" />, value: 3 },
    { label: <Badge color="green" text="待入职" />, value: 4 },
    { label: <Badge color="red" text="不匹配" />, value: 5 },
  ]

  const getResume = async () => {
    if (data?.data.applicant_resume_src) {
      const key = data?.data.applicant_resume_src.split('.com')[1]
      const res = await getFetcher(`/api/file/get?key=${key}`, { responseType: 'blob' })
      const blob = new Blob([res])
      setResumeBlob(URL.createObjectURL(blob))
      setResumeExt(data?.data.applicant_resume_src.split('.').pop())
    }
  }

  const download = () => {
    const link = document.createElement('a')
    link.href = resumeBlob
    link.download = `${data?.data.applicant_name}_${data?.data.application_job_title}.${resumeExt}`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const onStatusChange = async (e: any) => {
    setStatus(e.target.value)

    try {
      setUpdating(true)
      const result = await triggerUpdate({ 
        application_id: id,
        status: e.target.value
      })
      result.success ? message.success('操作成功') : message.error(result.message)
      setUpdating(false)
    } catch (err: any) {
      message.error(err.message.toString())
      setUpdating(false)
    }
  }

  useEffect(() => {
    getResume()
    setStatus(data?.data.application_status)
    setOpenid(data?.data.applicant_openid)
  }, [data]);

  return (
    <Spin spinning={isLoading}>
      <div className={`${styles['job-detail-page']} page`}>
        <Form
          wrapperCol={{
            xs: { span: 20 },
            sm: { span: 11},
          }}
        >
          <Form.Item label="姓名" labelCol={{ style: { width: LABEL_WIDTH } }}>
            {data?.data.applicant_name}
          </Form.Item>
          <Form.Item label="联系方式" labelCol={{ style: { width: LABEL_WIDTH } }}>
            {data?.data.applicant_contact}
          </Form.Item>
          <Form.Item label="申请职位" labelCol={{ style: { width: LABEL_WIDTH } }}>
            {data?.data.application_job_title}
          </Form.Item>
          <Form.Item label="分公司" labelCol={{ style: { width: LABEL_WIDTH } }}>
            {companyList?.list?.find((item: any) => item.company_id === data?.data.application_company_id)?.company_name}
          </Form.Item>
          <Form.Item label="部门" labelCol={{ style: { width: LABEL_WIDTH } }}>
            {data?.data.application_department}
          </Form.Item>
          <Form.Item label="申请时间" labelCol={{ style: { width: LABEL_WIDTH } }}>
            {data?.data ? format(data?.data.apply_time, 'yyyy-MM-dd HH:mm:ss') : ''}
          </Form.Item>
          <Form.Item label="简历" labelCol={{ style: { width: LABEL_WIDTH } }}>
            <Button onClick={download}>下载</Button>
          </Form.Item>
          <Form.Item label="简历预览" labelCol={{ style: { width: LABEL_WIDTH } }}>
            <div className={styles["pdf-wrapper"]}>
              {(resumeBlob && resumeExt === 'pdf') && <Document
                file={resumeBlob}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                {Array.apply(null, Array(numPages))
                  .map((_, i) => i + 1)
                  .map(page => <Page key={page} pageNumber={page} />)}
              </Document>}
              {(resumeBlob && resumeExt !== 'pdf') && <p className={styles["err-message"]}>仅支持预览pdf文件，其他文件请下载查看</p>}
            </div>
          </Form.Item>
        </Form>

        {applicationList && applicationList.list.length > 1 && <div>
          <div className={styles["relative-application"]}>
            <p>TA还申请了以下职位</p>
            <div className={styles["application-list"]}>
              {applicationList.list.filter((item: any) => item.application_job_id !== data?.data.application_job_id).map((item: any) => (
                <div className={styles["application-item"]} key={item.application_id}>
                  <div>{item.application_job_title}</div>
                  <Tag>{item.application_company_name}</Tag>
                </div>
              ))}
            </div>
          </div>
        </div>}

        <div className={styles["action-wrapper"]}>
          <Radio.Group
            options={statusOptions}
            optionType='button'
            onChange={onStatusChange}
            value={status}
            disabled={updating}
          />
        </div>
      </div>
    </Spin>
  )
}

export default JobDetailPage
