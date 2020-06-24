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
    <sba-panel :title="$t('instances.details.threads.title')" v-if="hasLoaded">
        <div>
            <div v-if="error" class="message is-danger">
                <div class="message-body">
                    <strong>
                        <font-awesome-icon class="has-text-danger" icon="exclamation-triangle"/>
                        <span v-text="$t('instances.details.threads.fetch_failed')"/>
                    </strong>
                    <p v-text="error.message"/>
                </div>
            </div>
            <div class="level threads-current" v-if="current">
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading has-bullet has-bullet-warning" v-text="$t('instances.details.threads.live')"/>
                        <p v-text="current.live"/>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading  has-bullet has-bullet-info" v-text="$t('instances.details.threads.daemon')"/>
                        <p v-text="current.daemon"/>
                    </div>
                </div>
                <div class="level-item has-text-centered">
                    <div>
                        <p class="heading" v-text="$t('instances.details.threads.peak_live')"/>
                        <p v-text="current.peak"/>
                    </div>
                </div>
            </div>
            <threads-chart v-if="chartData.length > 0" :data="chartData"/>
        </div>
    </sba-panel>
</template>

<script>
    import subscribing from '@/mixins/subscribing';
    import Instance from '@/services/instance';
    import {concatMap, timer} from '@/utils/rxjs';
    import moment from 'moment';
    import threadsChart from './threads-chart';

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
        components: {threadsChart},
        data: () => ({
            hasLoaded: false,
            error: null,
            current: null,
            chartData: [],
        }),
        methods: {
            async fetchMetrics() {
                if (this.details['live'] === undefined) {
                    return {
                        live: 0,
                        peak: 0,
                        daemon: 0
                    }
                }
                if (this.chartData.length > 10) {
                    this.chartData.splice(0, 1);
                }
                // eslint-disable-next-line no-console
                console.log(this.details)
                return this.details;
            },
            createSubscription() {
                const vm = this;
                vm.hasLoaded = true;
                // this.instance.socketIoClient.on('dashboard', function (data) {
                //
                //
                //   const statistical = data.data.dashboard.threadStatistical;
                //   // eslint-disable-next-line no-console
                //   console.log(statistical)
                //
                //   vm.current = statistical;
                //   vm.chartData.push({...statistical, timestamp: moment().valueOf()});
                //   if (vm.chartData.length > 10) {
                //     vm.chartData.splice(0, 1);
                //   }
                //
                //   // eslint-disable-next-line no-console
                //   console.log(vm.chartData)
                // });
                return timer(0, 2500)
                    .pipe(concatMap(this.fetchMetrics))
                    .subscribe({
                        next: data => {
                            vm.hasLoaded = true;
                            vm.current = data;
                            vm.chartData.push({...data, timestamp: moment().valueOf()});
                        },
                        error: error => {
                            vm.hasLoaded = true;
                            console.warn('Fetching threads metrics failed:', error);
                            vm.error = error;
                        }
                    });
            }
        }
    }
</script>

<style lang="scss">
    .threads-current {
        margin-bottom: 0 !important;
    }
</style>
