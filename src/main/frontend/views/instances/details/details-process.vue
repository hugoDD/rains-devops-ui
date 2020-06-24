<!--
  - Copyright 2014-2018 the original author or authors.
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -     http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -->

<template>
    <sba-panel :title="$t('instances.details.process.title')" v-if="hasLoaded">
        <div>
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <font-awesome-icon class="has-text-danger" icon="exclamation-triangle"/>
                        <span v-text="$t('instances.details.process.fetch_failed.')"/>
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <div class="level">
                <!--        <div class="level-item has-text-centered" v-if="pid">-->
                <!--          <div>-->
                <!--            <p class="heading" v-text="$t('instances.details.process.pid')" />-->
                <!--            <p v-text="pid" />-->
                <!--          </div>-->
                <!--        </div>-->
                <div class="level-item has-text-centered" v-if="uptime">
                    <div>
                        <p class="heading" v-text="$t('instances.details.process.uptime')"/>
                        <p>
                            <process-uptime :value="toMillis(uptime.value, uptime.baseUnit)"/>
                        </p>
                    </div>
                </div>
                <div class="level-item has-text-centered" v-if="processCpuLoad">
                    <div>
                        <p class="heading" v-text="$t('instances.details.process.process_cpu_usage')"/>
                        <p v-text="processCpuLoad"/>
                    </div>
                </div>
                <div class="level-item has-text-centered" v-if="systemCpuLoad">
                    <div>
                        <p class="heading" v-text="$t('instances.details.process.system_cpu_usage')"/>
                        <p v-text="systemCpuLoad"/>
                    </div>
                </div>
                <div class="level-item has-text-centered" v-if="systemCpuCount">
                    <div>
                        <p class="heading" v-text="$t('instances.details.process.cpus')"/>
                        <p v-text="systemCpuCount"/>
                    </div>
                </div>
            </div>

            <div class="level">

                <div class="level-item has-text-centered" v-if="gc.count">
                    <div>
                        <p class="heading" v-text="$t('instances.details.gc.count')"/>
                        <p v-text="gc.count"/>
                    </div>
                </div>
                <div class="level-item has-text-centered" v-if="gc.scavengeTime">
                    <div>
                        <p class="heading" v-text="$t('instances.details.gc.scavengeTime')"/>
                        <p v-text="gc.scavengeTime"/>
                    </div>
                </div>
            </div>
        </div>
    </sba-panel>

</template>

<script>
    import subscribing from '@/mixins/subscribing';
    import Instance from '@/services/instance';
    import {concatMap, timer} from '@/utils/rxjs';
    import {toMillis} from '../metrics/metric';
    import processUptime from './process-uptime';
    import SbaPanel from '../../../components/sba-panel';

    export default {
        props: {
            instance: {
                type: Instance,
                required: true
            },
            details: {
                type: Object,
                required: true
            }
        },
        mixins: [subscribing],
        components: {SbaPanel, processUptime},
        data: () => ({
            hasLoaded: false,
            error: null,
            osName: null,
            pid: null,
            uptime: {value: null, baseUnit: null},
            systemCpuLoad: null,
            processCpuLoad: null,
            systemCpuCount: null,
            gc: {count:0,scavengeTime:0}
        }),
        created() {
        },
        methods: {
            toMillis,
            createSubscription() {
                this.hasLoaded = true;
                const vm = this;

                return timer(0, 2500)
                    .pipe(concatMap(this.fetchCpuLoadMetrics))
                    .subscribe({
                        next: data => {
                            vm.processCpuLoad = data.processCpuLoad;
                            vm.systemCpuLoad = data.systemCpuLoad;
                            vm.osName = data.osName;
                            vm.pid = data.osName;
                            vm.uptime = data.uptime;
                            vm.systemCpuCount = data.processors;
                            vm.gc = data.gc;
                        },
                        error: error => {
                            vm.hasLoaded = true;
                            console.warn('Fetching CPU Usage metrics failed:', error);
                            vm.error = error;
                        }
                    });
            },
            async fetchCpuLoadMetrics() {
                if(this.details['gc']===undefined){
                    return {
                        hasLoaded: false,
                        error: null,
                        osName: '',
                        pid: '',
                        uptime: {value: null, baseUnit: null},
                        systemCpuLoad: '',
                        processCpuLoad: null,
                        systemCpuCount: null,
                        gc: {count:0,scavengeTime:0}
                    };
                }
                return this.details;
            },
            async fetchMetric(name) {
                const response = await this.instance.fetchMetric(name);
                return response.data;
            }
        }
    }
</script>
