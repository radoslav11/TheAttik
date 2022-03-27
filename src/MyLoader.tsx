import LoadingOverlay from 'react-loading-overlay-ts'
import {  Spin } from "antd";

export default function MyLoader({ active, children }) {
  return (
    <LoadingOverlay
      active={active}
      spinner={<Spin size='large' />}
      //@ts-ignore
      styles={{
        overlay: (base) => ({
          ...base,
          zIndex: 999999999,
          height: '100vh'
        })
      }}
    >
      {children}
    </LoadingOverlay>
  )
}