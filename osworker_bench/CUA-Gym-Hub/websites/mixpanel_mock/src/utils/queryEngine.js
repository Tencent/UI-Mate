// Query engine that computes real chart data from the events array

const CHART_COLORS = ['#4F44E0', '#E74C3C', '#4CAF50', '#F5A623', '#00BCD4', '#9C27B0', '#FF7043', '#607D8B']

export function executeInsightsQuery(events, report) {
  const { dateRange, granularity, metrics, breakdowns } = report
  if (!events || events.length === 0) return { labels: [], series: [] }

  const start = new Date(dateRange?.start || '2025-12-23')
  const end = new Date(dateRange?.end || '2026-01-22')
  end.setHours(23, 59, 59)

  // Filter events to date range
  const filtered = events.filter(e => {
    const t = new Date(e.time)
    return t >= start && t <= end
  })

  // Build date buckets
  const buckets = buildDateBuckets(start, end, granularity || 'Day')

  const series = []
  const tableRows = []

  for (const metric of (metrics || [])) {
    const eventName = metric.events?.[0]?.name || 'All Events'
    const measurement = metric.measurement || 'Total Events'

    if (breakdowns && breakdowns.length > 0) {
      const breakdownProp = breakdowns[0].property
      const groups = {}

      for (const evt of filtered) {
        if (eventName !== 'All Events' && evt.eventName !== eventName) continue
        let groupVal = ''
        if (breakdownProp === 'Event Name') {
          groupVal = evt.eventName
        } else if (breakdownProp === '$browser' || breakdownProp === 'Browser') {
          groupVal = evt.browser || 'Unknown'
        } else if (breakdownProp === '$country_code' || breakdownProp === 'Country') {
          groupVal = evt.country || 'Unknown'
        } else if (breakdownProp === '$city' || breakdownProp === 'City') {
          groupVal = evt.city || 'Unknown'
        } else if (breakdownProp === '$os' || breakdownProp === 'OS') {
          groupVal = evt.operatingSystem || 'Unknown'
        } else if (evt.properties && evt.properties[breakdownProp] !== undefined) {
          groupVal = String(evt.properties[breakdownProp])
        } else {
          groupVal = '(not set)'
        }
        if (!groups[groupVal]) groups[groupVal] = []
        groups[groupVal].push(evt)
      }

      // Take top 8 groups by count
      const sorted = Object.entries(groups).sort((a, b) => b[1].length - a[1].length).slice(0, 8)

      sorted.forEach(([groupName, groupEvents], gi) => {
        const data = computeBucketValues(groupEvents, buckets, measurement)
        const color = CHART_COLORS[gi % CHART_COLORS.length]
        series.push({
          name: `${metric.label}. ${groupName}`,
          color,
          data
        })
        const avg = data.length > 0 ? Math.round(data.reduce((a, b) => a + b, 0) / data.length * 10) / 10 : 0
        tableRows.push({ metric: `${metric.label}. ${metric.name}`, breakdown: groupName, average: avg, values: data })
      })
    } else {
      const evts = eventName === 'All Events' ? filtered : filtered.filter(e => e.eventName === eventName)
      const data = computeBucketValues(evts, buckets, measurement)
      const color = metric.events?.[0]?.color || CHART_COLORS[series.length % CHART_COLORS.length]
      series.push({
        name: `${metric.label}. ${metric.name}`,
        color,
        data
      })
      const avg = data.length > 0 ? Math.round(data.reduce((a, b) => a + b, 0) / data.length * 10) / 10 : 0
      tableRows.push({ metric: `${metric.label}. ${metric.name}`, average: avg, values: data })
    }
  }

  const labels = buckets.map(b => b.label)
  const columns = ['Metric']
  if (breakdowns && breakdowns.length > 0) columns.push(breakdowns[0].property)
  columns.push('Average', ...labels)

  return {
    chartData: { labels, series },
    tableData: { columns, rows: tableRows }
  }
}

export function executeFunnelQuery(events, report) {
  const { dateRange, steps } = report
  if (!steps || steps.length === 0) return { steps: [] }

  const start = new Date(dateRange?.start || '2025-12-23')
  const end = new Date(dateRange?.end || '2026-01-22')
  end.setHours(23, 59, 59)

  const filtered = events.filter(e => {
    const t = new Date(e.time)
    return t >= start && t <= end
  })

  // Group events by user
  const userEvents = {}
  for (const evt of filtered) {
    if (!userEvents[evt.distinctId]) userEvents[evt.distinctId] = []
    userEvents[evt.distinctId].push(evt)
  }

  // Sort each user's events by time
  for (const uid of Object.keys(userEvents)) {
    userEvents[uid].sort((a, b) => new Date(a.time) - new Date(b.time))
  }

  // Count users who completed each step in order
  const stepResults = []
  const totalUsers = Object.keys(userEvents).length
  let prevUsers = new Set(Object.keys(userEvents))

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]
    const usersAtStep = new Set()
    for (const uid of prevUsers) {
      const evts = userEvents[uid]
      if (evts && evts.some(e => e.eventName === step.eventName)) {
        usersAtStep.add(uid)
      }
    }

    const count = usersAtStep.size
    const overallPct = totalUsers > 0 ? Math.round(count / totalUsers * 10000) / 100 : 0
    const stepPct = prevUsers.size > 0 ? Math.round(count / prevUsers.size * 10000) / 100 : 0
    const dropOff = prevUsers.size - count
    const dropOffPct = prevUsers.size > 0 ? Math.round(dropOff / prevUsers.size * 10000) / 100 : 0

    stepResults.push({
      name: step.eventName,
      label: step.label,
      total: prevUsers.size,
      converted: count,
      convertedPct: i === 0 ? overallPct : stepPct,
      overallPct,
      dropOff,
      dropOffPct
    })

    prevUsers = usersAtStep
  }

  // Compute median time between first and last step
  let medianTime = null
  if (steps.length > 1) {
    const times = []
    for (const uid of Object.keys(userEvents)) {
      const evts = userEvents[uid]
      const firstStepTime = evts.find(e => e.eventName === steps[0].eventName)
      const lastStepTime = evts.find(e => e.eventName === steps[steps.length - 1].eventName)
      if (firstStepTime && lastStepTime) {
        const diff = new Date(lastStepTime.time) - new Date(firstStepTime.time)
        if (diff > 0) times.push(diff)
      }
    }
    if (times.length > 0) {
      times.sort((a, b) => a - b)
      const mid = Math.floor(times.length / 2)
      medianTime = times[mid]
    }
  }

  return { steps: stepResults, medianTime }
}

export function executeFlowQuery(events, report) {
  const { dateRange, flowConfig } = report
  const startEvent = flowConfig?.startEvent || 'Page View'
  const depth = flowConfig?.depth || 4

  const start = new Date(dateRange?.start || '2025-12-23')
  const end = new Date(dateRange?.end || '2026-01-22')
  end.setHours(23, 59, 59)

  const filtered = events.filter(e => {
    const t = new Date(e.time)
    return t >= start && t <= end
  })

  // Group by user, sort by time
  const userEvents = {}
  for (const evt of filtered) {
    if (!userEvents[evt.distinctId]) userEvents[evt.distinctId] = []
    userEvents[evt.distinctId].push(evt)
  }
  for (const uid of Object.keys(userEvents)) {
    userEvents[uid].sort((a, b) => new Date(a.time) - new Date(b.time))
  }

  // Build flow paths - for each user, get first N events starting from startEvent
  const paths = []
  for (const uid of Object.keys(userEvents)) {
    const evts = userEvents[uid]
    const startIdx = evts.findIndex(e => e.eventName === startEvent)
    if (startIdx === -1) continue
    const path = evts.slice(startIdx, startIdx + depth).map(e => e.eventName)
    paths.push(path)
  }

  // Build Sankey-like nodes and links
  const columns = []
  for (let col = 0; col < depth; col++) {
    const counts = {}
    for (const path of paths) {
      if (path[col]) {
        counts[path[col]] = (counts[path[col]] || 0) + 1
      }
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
    columns.push(sorted.map(([name, count]) => ({
      id: `flow_${col}_${name}`,
      name,
      count,
      pct: paths.length > 0 ? Math.round(count / paths.length * 100) : 0
    })))
  }

  // Build links between columns
  const links = []
  for (let col = 0; col < columns.length - 1; col++) {
    const sourceNames = new Set(columns[col].map(n => n.name))
    const targetNames = new Set(columns[col + 1].map(n => n.name))
    for (const path of paths) {
      if (path[col] && path[col + 1] && sourceNames.has(path[col]) && targetNames.has(path[col + 1])) {
        const linkKey = `${path[col]}|${path[col + 1]}`
        const existing = links.find(l => l.key === linkKey && l.sourceCol === col)
        if (existing) {
          existing.value++
        } else {
          links.push({ key: linkKey, sourceCol: col, source: path[col], target: path[col + 1], value: 1 })
        }
      }
    }
  }

  return { columns, links, totalPaths: paths.length }
}

export function executeRetentionQuery(events, report) {
  const { dateRange, retentionConfig, granularity } = report
  const firstEvent = retentionConfig?.firstEvent || 'Page View'
  const returnEvent = retentionConfig?.returnEvent || 'Any Event'

  const start = new Date(dateRange?.start || '2025-12-23')
  const end = new Date(dateRange?.end || '2026-01-22')
  end.setHours(23, 59, 59)

  const filtered = events.filter(e => {
    const t = new Date(e.time)
    return t >= start && t <= end
  })

  const periodMs = (granularity === 'Week') ? 7 * 86400000 : 86400000
  const periodLabel = granularity === 'Week' ? 'Week' : 'Day'

  // Build cohorts by period
  const numPeriods = Math.ceil((end - start) / periodMs)
  const cohorts = []

  for (let p = 0; p < Math.min(numPeriods, 6); p++) {
    const cohortStart = new Date(start.getTime() + p * periodMs)
    const cohortEnd = new Date(cohortStart.getTime() + periodMs)

    // Users who did firstEvent in this period
    const cohortUsers = new Set()
    for (const evt of filtered) {
      const t = new Date(evt.time)
      if (t >= cohortStart && t < cohortEnd) {
        if (firstEvent === 'Any Event' || firstEvent === 'Page View' || evt.eventName === firstEvent) {
          cohortUsers.add(evt.distinctId)
        }
      }
    }

    if (cohortUsers.size === 0) continue

    // For each subsequent period, check how many returned
    const retention = []
    const maxFollowUp = Math.min(numPeriods - p, 6)
    for (let f = 0; f < maxFollowUp; f++) {
      const checkStart = new Date(start.getTime() + (p + f) * periodMs)
      const checkEnd = new Date(checkStart.getTime() + periodMs)

      const returnedUsers = new Set()
      for (const evt of filtered) {
        const t = new Date(evt.time)
        if (t >= checkStart && t < checkEnd && cohortUsers.has(evt.distinctId)) {
          if (returnEvent === 'Any Event' || evt.eventName === returnEvent) {
            returnedUsers.add(evt.distinctId)
          }
        }
      }

      retention.push(Math.round(returnedUsers.size / cohortUsers.size * 100))
    }

    const startStr = cohortStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endStr = new Date(cohortEnd.getTime() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    cohorts.push({
      period: `${startStr} - ${endStr}`,
      users: cohortUsers.size,
      retention
    })
  }

  return { cohorts, periodLabel }
}

// Helper: build date buckets
function buildDateBuckets(start, end, granularity) {
  const buckets = []
  const current = new Date(start)

  while (current <= end) {
    const bucketStart = new Date(current)
    let bucketEnd, label

    switch (granularity) {
      case 'Hour':
        label = current.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })
        bucketEnd = new Date(current)
        bucketEnd.setHours(bucketEnd.getHours() + 1)
        current.setHours(current.getHours() + 1)
        break
      case 'Week':
        label = `Week of ${current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
        bucketEnd = new Date(current)
        bucketEnd.setDate(bucketEnd.getDate() + 7)
        current.setDate(current.getDate() + 7)
        break
      case 'Month':
        label = current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        bucketEnd = new Date(current)
        bucketEnd.setMonth(bucketEnd.getMonth() + 1)
        current.setMonth(current.getMonth() + 1)
        break
      default: // Day
        label = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        bucketEnd = new Date(current)
        bucketEnd.setDate(bucketEnd.getDate() + 1)
        current.setDate(current.getDate() + 1)
        break
    }

    buckets.push({ start: bucketStart, end: bucketEnd, label })
  }

  return buckets
}

// Helper: compute values per bucket
function computeBucketValues(events, buckets, measurement) {
  return buckets.map(bucket => {
    const inBucket = events.filter(e => {
      const t = new Date(e.time)
      return t >= bucket.start && t < bucket.end
    })

    switch (measurement) {
      case 'Unique Users':
        return new Set(inBucket.map(e => e.distinctId)).size
      case 'Total Sessions':
        return new Set(inBucket.map(e => e.distinctId)).size // approximate
      case 'Frequency per User': {
        const users = new Set(inBucket.map(e => e.distinctId))
        return users.size > 0 ? Math.round(inBucket.length / users.size * 10) / 10 : 0
      }
      case 'Total Events':
      default:
        return inBucket.length
    }
  })
}
