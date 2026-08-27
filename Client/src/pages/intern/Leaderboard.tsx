import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardBody } from '../../components/ui/Card'
import { useAuthStore } from '../../stores/authStore'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const podiumColors = ['text-yellow-500', 'text-gray-400', 'text-amber-600']
const podiumBg = ['bg-yellow-50 dark:bg-yellow-900/20', 'bg-gray-50 dark:bg-gray-900/20', 'bg-amber-50 dark:bg-amber-900/20']

export default function Leaderboard() {
  const { user } = useAuthStore()
  const [leaders, setLeaders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    userService.getLeaderboard()
      .then(res => setLeaders(res.data.data || res.data || []))
      .catch(() => toast.error('Failed to load leaderboard'))
      .finally(() => setLoading(false))
  }, [])

  const top3 = leaders.slice(0, 3)
  const rest = leaders.slice(3)

  if (loading) return <div className="page-container"><div className="h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" /></div>

  return (
    <div className="page-container space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primaryText">Leaderboard 🏆</h2>
          <p className="text-sm text-muted mt-1">Rankings based on goals completed + reports approved</p>
        </div>
      </div>

      {leaders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-border dark:border-gray-700">
          <Trophy size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-muted">No data available yet. Start completing goals to climb the rank!</p>
        </div>
      ) : (
        <>
          {/* Podium - Top 3 */}
          {top3.length > 0 && (
            <div className={`grid ${top3.length === 1 ? 'grid-cols-1 max-w-sm mx-auto' : top3.length === 2 ? 'grid-cols-2 max-w-xl mx-auto' : 'grid-cols-3'} gap-2 sm:gap-4`}>
              { (top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3).map((leader, idx) => {
                let actualRank = 0;
                if (top3.length === 3) {
                  actualRank = leader === top3[0] ? 0 : leader === top3[1] ? 1 : 2
                } else {
                  actualRank = leaders.indexOf(leader);
                }
                
                return (
                  <motion.div
                    key={leader._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`${podiumBg[actualRank]} rounded-2xl p-3 sm:p-6 text-center border border-border dark:border-gray-700 ${actualRank === 0 ? 'order-2 shadow-hover scale-105 z-10' : actualRank === 1 ? 'order-1 mt-3 sm:mt-6' : 'order-3 mt-3 sm:mt-6'}`}
                  >
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{['🥇','🥈','🥉'][actualRank]}</div>
                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-sm sm:text-lg mx-auto mb-1.5 sm:mb-2 shadow-md">
                      {leader.name.charAt(0)}
                    </div>
                    <p className={`font-bold text-xs sm:text-sm truncate ${podiumColors[actualRank]}`}>{leader.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted truncate">{leader.department || 'General'}</p>
                    <p className="text-lg sm:text-xl font-black text-primaryText mt-1 sm:mt-2">{leader.score}</p>
                    <p className="text-[9px] sm:text-[10px] text-muted uppercase tracking-wider">points</p>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Rest of the list */}
          {rest.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Full Rankings</CardTitle></CardHeader>
              <CardBody>
                <div className="space-y-1">
                  {rest.map((leader, i) => {
                    const isMe = leader._id === user?.id
                    const rank = i + 4
                    return (
                      <motion.div
                        key={leader._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${isMe ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                      >
                        <span className="w-6 text-center font-bold text-sm text-muted">{rank}</span>
                        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-primary-600 font-bold text-sm">
                          {leader.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-primaryText truncate">
                            {leader.name} {isMe && <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded ml-1 uppercase">Me</span>}
                          </p>
                          <p className="text-xs text-muted truncate">{leader.department || 'General'} • {leader.goalsCompleted} goals • {leader.reportsApproved} reports</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primaryText">{leader.score}</p>
                          <p className="text-[10px] text-muted uppercase">pts</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
