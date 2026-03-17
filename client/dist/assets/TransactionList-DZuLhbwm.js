import{c,j as e}from"./index-BgMPZvdU.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=[["path",{d:"M17 7 7 17",key:"15tmo1"}],["path",{d:"M17 17H7V7",key:"1org7z"}]],o=c("arrow-down-left",n);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const a=[["path",{d:"M7 7h10v10",key:"1tivn9"}],["path",{d:"M7 17 17 7",key:"1vkiza"}]],d=c("arrow-up-right",a);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=[["rect",{width:"20",height:"12",x:"2",y:"6",rx:"2",key:"9lu3g6"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"M6 12h.01M18 12h.01",key:"113zkx"}]],x=c("banknote",l);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=[["circle",{cx:"8",cy:"21",r:"1",key:"jimo8o"}],["circle",{cx:"19",cy:"21",r:"1",key:"13723u"}],["path",{d:"M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12",key:"9zh506"}]],h=c("shopping-cart",p),m={Salary:x,Groceries:h,Rent:o};function g({transactions:s,emptyMessage:i="No transactions found yet."}){return s.length?e.jsx("section",{className:"space-y-3 px-4 pb-28",children:s.map(t=>{const r=m[t.title]||(t.type==="income"?d:o);return e.jsxs("article",{className:"grid grid-cols-[52px,1fr,auto] items-center gap-3 rounded-card bg-white p-4 shadow-panel",children:[e.jsx("div",{className:`grid h-12 w-12 place-items-center rounded-2xl ${t.type==="income"?"bg-brand/15 text-brand-500":"bg-blue-50 text-expense"}`,children:e.jsx(r,{size:20})}),e.jsxs("div",{children:[e.jsx("p",{className:"font-semibold text-ink",children:t.title}),e.jsx("p",{className:"text-xs text-slateSoft",children:t.time})]}),e.jsxs("div",{className:"text-right",children:[e.jsx("p",{className:"text-xs text-slateSoft",children:t.category}),e.jsx("p",{className:`mt-1 font-semibold ${t.type==="income"?"text-income":"text-expense"}`,children:t.amount})]})]},t.id)})}):e.jsx("section",{className:"px-4 pb-28",children:e.jsx("div",{className:"rounded-card bg-white p-6 text-center text-sm text-slateSoft shadow-panel",children:i})})}export{g as T};
