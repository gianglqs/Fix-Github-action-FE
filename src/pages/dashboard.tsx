import { useEffect, useMemo, useState } from "react"
import { styled } from "@mui/material/styles"
import MuiDrawer from "@mui/material/Drawer"
import Box from "@mui/material/Box"
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import List from "@mui/material/List"
import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import Badge from "@mui/material/Badge"
import Grid from "@mui/material/Grid"
import Paper from "@mui/material/Paper"
import Link from "@mui/material/Link"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import NotificationsIcon from "@mui/icons-material/Notifications"
import CreateIcon from "@mui/icons-material/AddCircle"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import DashboardIcon from "@mui/icons-material/Dashboard"
import PeopleIcon from "@mui/icons-material/People"
import LayersIcon from "@mui/icons-material/Layers"
import { ReplayOutlined as ReloadIcon } from "@mui/icons-material"
import { Button, CssBaseline } from "@mui/material"

import { useDispatch, useSelector } from "react-redux"
import { dashboardStore } from "@/store/reducers"
import { createAction } from "@reduxjs/toolkit"
import { useRouter } from "next/router"

import { iconColumn } from "@/utils/columnProperties"
import dashboardApi from "@/api/dashboard.api"

import { AppFooter, AppSearchBar, DataTable, EditIcon } from "@/components"
import { DialogCreateUser } from "@/components/Dialog/Module/Dashboard/CreateDialog"
import { DeactiveUserDialog } from "@/components/Dialog/Module/Dashboard/DeactiveUserDialog"
import { DialogUpdateUser } from "@/components/Dialog/Module/Dashboard/UpdateDialog"
import Image from "next/image"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const logo = require("../public/logo.svg")

const drawerWidth: number = 240

interface AppBarProps extends MuiAppBarProps {
  open?: boolean
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}))

export default function Dashboard() {
  const [open, setOpen] = useState(true)
  createAction(`dashboard/GET_LIST`)
  const entityApp = "dashboard"
  const getListAction = useMemo(
    () => createAction(`${entityApp}/GET_LIST`),
    [entityApp]
  )
  const resetStateAction = useMemo(
    () => createAction(`${entityApp}/RESET_STATE`),
    [entityApp]
  )
  const router = useRouter()
  const dispatch = useDispatch()
  const listUser = useSelector(dashboardStore.selectUserList)

  useEffect(() => {
    dispatch(getListAction())
  }, [getListAction, router.query])

  useEffect(() => {
    return () => {
      dispatch(resetStateAction())
    }
  }, [router.pathname])

  const toggleDrawer = () => {
    setOpen(!open)
  }

  const defaultValue = {
    userName: "",
    password: "",
    email: "",
    role: 1,
    defaultLocale: "us",
  }

  const [dialogCreateUser, setDialogCreateUser] = useState({
    open: false,
    detail: defaultValue as any,
  })

  const [updateUserState, setUpdateUserState] = useState({
    open: false,
    detail: {} as any,
  })

  const [deactivateUserState, setDeactivateUserState] = useState({
    open: false,
    detail: {} as any,
  })

  const handleOpenCreateDialog = () => {
    setDialogCreateUser({
      open: true,
      detail: defaultValue,
    })
  }

  const handleCloseCreateDialog = () => {
    setDialogCreateUser({
      open: false,
      detail: defaultValue,
    })
  }

  const handleCloseDeactiveUser = () => {
    setDeactivateUserState({
      open: false,
      detail: {},
    })
  }

  const handleOpenDeactivateUser = (row) => {
    setDeactivateUserState({
      open: true,
      detail: { userName: row?.userName, id: row?.id, isActive: row?.active },
    })
  }

  const handleSearch = async (event, searchQuery) => {
    const { data } = await dashboardApi.getUser({ search: searchQuery })
    dispatch(dashboardStore.actions.setUserList(JSON.parse(data)?.userList))
  }

  const handleOpenUpdateUserDialog = async (userId) => {
    try {
      // Get init data

      const { data } = await dashboardApi.getDetailUser(userId)

      // Open form
      setUpdateUserState({
        open: true,
        detail: JSON.parse(data)?.userDetails,
      })
    } catch (error) {
      // dispatch(commonStore.actions.setErrorMessage(error))
    }
  }

  const handleCloseUpdateUserDialog = () => {
    setUpdateUserState({
      open: false,
      detail: {},
    })
  }

  const columns = [
    {
      field: "email",
      flex: 0.8,
      headerName: "Email",
    },
    {
      field: "role",
      flex: 0.8,
      headerName: "Role",
      renderCell(params) {
        return <span>{params.row.role.roleName}</span>
      },
    },
    {
      field: "userName",
      flex: 0.8,
      headerName: "Name",
    },
    {
      field: "lastLogin",
      flex: 0.4,
      headerName: "Last Login",
    },
    {
      ...iconColumn,
      field: "active",
      flex: 0.3,
      headerName: "Status",
      renderCell(params) {
        return (
          <Button
            variant="outlined"
            color={`${params.row.active ? "primary" : "error"}`}
            onClick={() => handleOpenDeactivateUser(params.row)}
          >
            {params.row.active ? "Active" : "Locked"}
          </Button>
        )
      },
    },
    {
      ...iconColumn,
      field: "id",
      headerName: "Edit",
      flex: 0.2,
      renderCell(params) {
        return (
          <EditIcon onClick={() => handleOpenUpdateUserDialog(params.row.id)} />
        )
      },
    },
  ]

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <AppBar position="absolute" open={open}>
          <Toolbar
            sx={{
              pr: "24px", // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: "36px",
                ...(open && { display: "none" }),
              }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              component="h1"
              variant="h6"
              color="inherit"
              noWrap
              sx={{ flexGrow: 1 }}
            >
              {/* Dashboard */}
            </Typography>
            <IconButton color="inherit">
              <Badge color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar>
        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              px: [1],
            }}
          >
            <Image src={logo} width={185} height={60} alt="Hyster-Yale" />
            <IconButton onClick={toggleDrawer}>
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>
          <Divider />
          <List component="nav">
            <ListItemButton>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            <ListItemButton>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Users" />
            </ListItemButton>
            <Link href={`/bookingOrder`}>
              <ListItemButton>
                <ListItemIcon>
                  <LayersIcon />
                </ListItemIcon>
                <ListItemText primary="Financial Bookings" />
              </ListItemButton>
            </Link>
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Grid container justifyContent="flex-end" sx={{ padding: 1 }}>
            <Button
              variant="contained"
              style={{ marginLeft: 5 }}
              color="primary"
            >
              <ReloadIcon />
              Reload
            </Button>
            <Button
              onClick={handleOpenCreateDialog}
              variant="contained"
              style={{ marginLeft: 5 }}
              color="primary"
            >
              <CreateIcon />
              New User
            </Button>
          </Grid>
          <Grid container sx={{ padding: 1, paddingLeft: 1.5 }}>
            <AppSearchBar onSearch={handleSearch}></AppSearchBar>
          </Grid>
          <Paper elevation={1} sx={{ marginLeft: 1.5, marginRight: 1.5 }}>
            <Grid container>
              <DataTable
                hideFooter
                disableColumnMenu
                checkboxSelection
                tableHeight={795}
                rowHeight={50}
                rows={listUser}
                columns={columns}
              />
            </Grid>
            <AppFooter />
          </Paper>
        </Box>
      </Box>

      <DialogCreateUser
        {...dialogCreateUser}
        onClose={handleCloseCreateDialog}
      />
      <DeactiveUserDialog
        {...deactivateUserState}
        onClose={handleCloseDeactiveUser}
      />
      <DialogUpdateUser
        {...updateUserState}
        onClose={handleCloseUpdateUserDialog}
      />
    </>
  )
}
