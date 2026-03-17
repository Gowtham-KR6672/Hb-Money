import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const colors = ['#6EE7B7', '#60A5FA', '#1D4ED8', '#0ACF83'];

export default function ExpenseChart({ data, title = 'April Expenses' }) {
  return (
    <section className="px-4">
      <div className="rounded-[30px] bg-white p-5 shadow-panel">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-ink">{title}</p>
            <p className="text-xs text-slateSoft">Spending overview for the selected period</p>
          </div>
        </div>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#DCEEE3" />
              <XAxis
                dataKey="name"
                interval={0}
                tick={{ fill: '#64748B', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#ECFFF7' }} />
              <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
