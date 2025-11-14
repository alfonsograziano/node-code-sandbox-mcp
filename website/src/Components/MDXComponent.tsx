// import { AnchorHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react'


import { ReactNode, AnchorHTMLAttributes } from 'react';

type WithChildren = { children?: ReactNode };
type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode };

export const MDXComponent = {
  h1: ({ children }: WithChildren) => <h1 className="text-5xl max-w-[850px] leading-[1.2] md:leading-[1.2] md:text-7xl font-bold text-white">{children}</h1>,
  h2: ({ children }: WithChildren) => <h2 className="text-4xl leading-[1.2] font-bold text-white">{children}</h2>,
  h3: ({ children }: WithChildren) => <h3 className="mt-8 text-lg font-bold text-gray-100">{children}</h3>,
  p: ({ children }: WithChildren) => <p className="my-4 text-xl leading-normal text-gray-200">{children}</p>,
  a: ({ children, href }: AnchorProps) => (
    <a href={href} className="my-4 text-xl leading-normal text-green-600 hover:text-green-500 underline underline-offset-[3px] transition-colors">
      {children}
    </a>
  ),
  li: ({ children }: WithChildren) => <li className="text-xl leading-normal text-gray-200">{children}</li>,
  ul: ({ children }: WithChildren) => <ul className="list-disc pl-10 text-gray-200">{children}</ul>,
  ol: ({ children }: WithChildren) => <ol className="list-decimal pl-10 text-gray-200">{children}</ol>,
  code: ({ children }: WithChildren) => <code className="rounded-md p-2 bg-gray-900/60 border border-gray-800 text-green-400 font-mono text-sm">{children}</code>,
  hr: () => <hr className="mt-10 border-gray-700 border-2" />,
};
