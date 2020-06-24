export const dashboardQuery = `subscription dashboard($machineId:Long){
  dashboard(machineId: $machineId){
    command
    threads {
      id
      name
      group
      priority
      state
      cpu
      time
      interrupted
      daemon
    }
    memory {
      heap {
        used
        total
        max
        usage
      }
      edenSpace {
        used
        total
        max
        usage
      }
      survivorSpace {
        used
        total
        max
        usage
      }
      oldGen {
        used
        total
        max
        usage
      }
      nonheap {
        used
        total
        max
        usage
      }
      codeCache {
        used
        total
        max
        usage
      }
      metaspace {
        used
        total
        max
        usage
      }
      compressedClassSpace {
        used
        total
        max
        usage
      }
      direct {
        used
        total
        max
        usage
      }
      mapped {
        used
        total
        max
        usage
      }
      gc {
        scavengeCount
        scavengeTime
        marksweepCount
        marksweepTime
      }
    }
    runtimeInfo {
      osName
      osVersion
      javaVersion
      javaHome
      systemloadAverage
      processors
      uptime
    }
    threadStatistical {
      live
      peak
      daemon
    }
  }
}`

export const envQuery = `query generalCommand($machineId:Long,$cmd:String){
  generalCommand(machineId: $machineId, cmd: $cmd){
    key
    value
  }
}`

export const postCommand = `mutation postCommand($machineId:Long,$cmd:String){
  postCommand(machineId: $machineId, cmd: $cmd){
    key
    value
  }
}`

export const simpleScCommand = `query scCommand($machineId:Long,$cmd:String){
  scCommand(machineId: $machineId, cmd: $cmd) {
    name
    simpleName
  }
}`
