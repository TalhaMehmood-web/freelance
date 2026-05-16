"use client"

import React from "react"
import { transformUrl } from "@/utils/urlTransformer"

interface DImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src:            string
  alt:            string
  blurSrc?:       string
  skipTransform?: boolean
  fill?:          boolean
}

export default function DImage({
  src,
  alt,
  className     = "",
  style,
  blurSrc,
  skipTransform = false,
  fill,
  ...props
}: DImageProps) {
  const finalSrc = skipTransform ? src : transformUrl(src)

  const fillStyle: React.CSSProperties = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }
    : {}

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={finalSrc}
      alt={alt}
      className={`object-cover ${className}`}
      style={{ ...fillStyle, ...style }}
      {...props}
    />
  )
}
