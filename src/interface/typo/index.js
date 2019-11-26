import React from 'react'

export function Text({
  tag: Tag = 'span',
  size = 2,
  bold = false,
  children,
  className
}) {
  const classNames = [`text-${size}`, bold && 'bold', className]
    .filter(Boolean)
    .join(' ')
  return <Tag className={classNames}>{children}</Tag>
}
