
    import React from 'react'
    import ReactDOM from 'react-dom/client'
    import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
    import './index.css'
    import { StoreProvider } from './lib/store'

    import Layout from './components/Layout'
    import Dashboard from './pages/Dashboard'
    import RepoLayout from './pages/Repo/RepoLayout'
    import CodeBrowser from './pages/Repo/CodeBrowser'
    import Commits from './pages/Repo/Commits'
    import CommitDetail from './pages/Repo/CommitDetail'
    import Issues from './pages/Repo/Issues'
    import IssueDetail from './pages/Repo/IssueDetail'
    import NewIssue from './pages/Repo/NewIssue'
    import PullRequests from './pages/Repo/PullRequests'
    import PullRequestDetail from './pages/Repo/PullRequestDetail'
    import ProjectBoard from './pages/Repo/ProjectBoard'
    import Wiki from './pages/Repo/Wiki'
    import Settings from './pages/Repo/Settings'
    import Actions from './pages/Repo/Actions'
    import Security from './pages/Repo/Security'
    import Milestones from './pages/Repo/Milestones'
    import Insights from './pages/Repo/Insights'
    import Contributors from './pages/Repo/Contributors'
    import Discussions from './pages/Repo/Discussions'
    import Branches from './pages/Repo/Branches'
    import Releases from './pages/Repo/Releases'
    import GoDebug from './pages/GoDebug'
    import NewRepo from './pages/NewRepo'
    import UserProfile from './pages/UserProfile'

    const router = createBrowserRouter([
      {
        path: "/go",
        element: <GoDebug />
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Dashboard />
          },
          {
            path: "new",
            element: <NewRepo />
          },
          {
            path: "profile/:username",
            element: <UserProfile />
          },
          {
            path: ":username/:repoName",
            element: <RepoLayout />,
            children: [
              {
                index: true,
                element: <CodeBrowser />
              },
              {
                path: "blob/*",
                element: <CodeBrowser />
              },
              {
                path: "commits",
                element: <Commits />
              },
              {
                path: "commit/:commitId",
                element: <CommitDetail />
              },
              {
                path: "issues",
                element: <Issues />
              },
              {
                path: "issues/new",
                element: <NewIssue />
              },
              {
                path: "issues/:issueNumber",
                element: <IssueDetail />
              },
              {
                path: "pulls",
                element: <PullRequests />
              },
              {
                path: "pulls/:prNumber",
                element: <PullRequestDetail />
              },
              {
                path: "projects",
                element: <ProjectBoard />
              },
              {
                path: "wiki",
                element: <Wiki />
              },
              {
                path: "settings",
                element: <Settings />
              },
              {
                path: "milestones",
                element: <Milestones />
              },
              {
                path: "actions",
                element: <Actions />
              },
              {
                path: "security",
                element: <Security />
              },
              {
                path: "insights",
                element: <Insights />
              },
              {
                path: "graphs/contributors",
                element: <Contributors />
              },
              {
                path: "discussions",
                element: <Discussions />
              },
              {
                path: "branches",
                element: <Branches />
              },
              {
                path: "releases",
                element: <Releases />
              }
            ]
          }
        ]
      }
    ]);

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <StoreProvider>
          <RouterProvider router={router} />
        </StoreProvider>
      </React.StrictMode>,
    )
