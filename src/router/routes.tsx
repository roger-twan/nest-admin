import { Navigate} from 'react-router-dom'
import MainLayout from '@/layouts/main'
import HomePage from '@/pages/home'
import LoginPage from '@/pages/login'
import BannerListPage from '@/pages/banner/list'
import BannerEditPage from '@/pages/banner/edit'
import MenuListPage from '@/pages/menu/list'
import MenuEditPage from '@/pages/menu/edit'
import CompanyListPage from '@/pages/company/list'
import CompanyEditPage from '@/pages/company/edit'
import AccountListPage from '@/pages/account/list'
import AccountNewPage from '@/pages/account/new'
import AccountResetPwdPage from '@/pages/account/reset-password'
import AccountManageCompanyPage from '@/pages/account/manage-company'
import JobListPage from '@/pages/job/list'
import JobEditPage from '@/pages/job/edit/edit'
import LabelManagePage from '@/pages/job/label/label'
import ApplicationListPage from '@/pages/application/list'
import ApplicationDetailPage from '@/pages/application/detail'
import ApplicationDeleteHistoryPage from '@/pages/application/delete-history'
import VideoListPage from '@/pages/video/list'
import VideoEditPage from '@/pages/video/edit'
import PageListPage from '@/pages/page/list'
import PageEditPage from '@/pages/page/edit/edit'
import ResetPwdPage from '@/pages/reset-pwd/reset-pwd'

const routes = [
  {
    path: '/',
    id: 'root',
    element: <MainLayout />,
    children: [
      { path: '', element: <Navigate to='/home' replace /> },
      {
        path: '/home',
        element: <HomePage />,
        extra: {
          isMenu: true,
          title: 'Home',
          permission: ['super', 'general'],
        },
      },
      {
        path: '/home-management',
        extra: {
          isMenu: true,
          title: 'Configuration',
          permission: ['super'],
        },
        children: [
          { path: '', element: <Navigate to='/home-management/banner' replace /> },
          {
            path: '/home-management/banner',
            extra: {
              isMenu: true,
              title: 'Banner',
              permission: ['super'],
            },
            children: [
              {
                index: true,
                path: '',
                element: <BannerListPage />,
                extra: {
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/banner/new',
                element: <BannerEditPage />,
                extra: {
                  title: 'New Banner',
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/banner/edit',
                element: <BannerEditPage />,
                extra: {
                  title: 'Edit Banner',
                  permission: ['super'],
                },
              }
            ]
          },
          {
            path: '/home-management/menu',
            extra: {
              isMenu: true,
              title: 'Menu Management',
              permission: ['super'],
            },
            children: [
              {
                path: '',
                element: <MenuListPage />,
                extra: {
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/menu/new',
                element: <MenuEditPage />,
                extra: {
                  title: 'New Menu',
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/menu/edit',
                element: <MenuEditPage />,
                extra: {
                  title: 'Edit Menu',
                  permission: ['super'],
                },
              }
            ]
          },
          {
            path: '/home-management/page',
            extra: {
              isMenu: true,
              title: 'Page Management',
              permission: ['super'],
            },
            children: [
              {
                path: '',
                element: <PageListPage />,
                extra: {
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/page/new',
                element: <PageEditPage />,
                extra: {
                  title: 'New Page',
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/page/edit',
                element: <PageEditPage />,
                extra: {
                  title: 'Edit Page',
                  permission: ['super'],
                },
              }
            ]
          },
          {
            path: '/home-management/video',
            extra: {
              isMenu: true,
              title: 'Video Management',
              permission: ['super'],
            },
            children: [
              {
                path: '',
                element: <VideoListPage />,
                extra: {
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/video/new',
                element: <VideoEditPage />,
                extra: {
                  title: 'New Video',
                  permission: ['super'],
                },
              },
              {
                path: '/home-management/video/edit',
                element: <VideoEditPage />,
                extra: {
                  title: 'Edit Video',
                  permission: ['super'],
                },
              }
            ]
          },
        ]
      },
      {
        path: '/company-management',
        extra: {
          isMenu: true,
          title: 'Branch Management',
          permission: ['super', 'general'],
        },
        children: [
          {
            path: '',
            element: <CompanyListPage />,
            extra: {
              permission: ['super', 'general'],
            },
          },
          {
            path: '/company-management/new',
            element: <CompanyEditPage />,
            extra: {
              title: 'New Branch',
              permission: ['super'],
            },
          },
          {
            path: '/company-management/edit',
            element: <CompanyEditPage />,
            extra: {
              title: 'Edit Branch',
              permission: ['super', 'general'],
            },
          }
        ]
      },
      {
        path: '/account-management',
        extra: {
          isMenu: true,
          title: 'Account Management',
          permission: ['super'],
        },
        children: [
          {
            path: '',
            element: <AccountListPage />,
            extra: {
              permission: ['super'],
            },
          },
          {
            path: '/account-management/new',
            element: <AccountNewPage />,
            extra: {
              title: 'New Account',
              permission: ['super'],
            },
          },
          {
            path: '/account-management/reset-password',
            element: <AccountResetPwdPage />,
            extra: {
              title: 'Reset Password',
              permission: ['super'],
            },
          },
          {
            path: '/account-management/manage-company',
            element: <AccountManageCompanyPage />,
            extra: {
              title: 'Edit Permission',
              permission: ['super'],
            },
          }
        ]
      },
      {
        path: '/job-management',
        extra: {
          isMenu: true,
          title: 'Job List',
          permission: ['super', 'general'],
        },
        children: [
          {
            path: '',
            element: <JobListPage />,
            extra: {
              permission: ['super', 'general'],
            },
          },
          {
            path: '/job-management/label',
            element: <LabelManagePage />,
            extra: {
              title: 'Label Management',
              permission: ['super', 'general'],
            },
          },
          {
            path: '/job-management/new',
            element: <JobEditPage />,
            extra: {
              title: 'New Job',
              permission: ['super', 'general'],
            },
          },
          {
            path: '/job-management/edit',
            element: <JobEditPage />,
            extra: {
              title: 'Edit Job',
              permission: ['super', 'general'],
            },
          }
        ]
      },
      {
        path: '/application-management',
        extra: {
          isMenu: true,
          title: 'Application List',
          permission: ['super', 'general'],
        },
        children: [
          {
            path: '',
            element: <ApplicationListPage />,
            extra: {
              permission: ['super', 'general'],
            },
          },
          {
            path: '/application-management/detail',
            element: <ApplicationDetailPage />,
            extra: {
              title: 'Application Detail',
              permission: ['super', 'general'],
            },
          },
          {
            path: '/application-management/delete-history',
            element: <ApplicationDeleteHistoryPage />,
            extra: {
              title: 'Delete History',
              permission: ['super', 'general'],
            },
          },
        ]
      },
      {
        path: '/reset-password',
        extra: {
          title: 'Reset Password',
          permission: ['general'],
        },
        element: <ResetPwdPage />
      },
    ]
  },
  {
    path: '/login',
    element: <LoginPage />
  }
]

export default routes
