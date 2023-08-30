import React from 'react'
import { Button, ConfigProvider } from 'antd'
import theme from '@/theme/themeConfig'

const Home = () => (
  <ConfigProvider theme={theme}>
    <div className="App">
    </div>
  </ConfigProvider>
)

export default Home;
