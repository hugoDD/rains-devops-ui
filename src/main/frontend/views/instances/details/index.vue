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
    <section class="section">
        <div class="details-header">
            <h1 class="title" v-if="instance" v-text="instance.registration.name"/>
            <h2 class="subtitle is-5" v-if="instance">
                Id: <span v-text="instance.id"/>
            </h2>
            <sba-tags v-if="instance" :tags="instance.tags"/>
            <div class="details-header__urls">
                <a class="button is-small " :href="instance.registration.serviceUrl">
                    <font-awesome-icon icon="home"/>&nbsp;
                    <span v-text="instance.registration.serviceUrl"/>
                </a>
                <a class="button is-small " :href="instance.registration.managementUrl">
                    <font-awesome-icon icon="wrench"/>&nbsp;
                    <span v-text="instance.registration.managementUrl"/>
                </a>
                <a class="button is-small " :href="instance.registration.healthUrl">
                    <font-awesome-icon icon="heartbeat"/>&nbsp;
                    <span v-text="instance.registration.healthUrl"/>
                </a>
            </div>
        </div>
        <hr>
        <div v-if="error" class="message is-danger">
            <div class="message-body">
                <strong>
                    <font-awesome-icon class="has-text-danger" icon="exclamation-triangle"/>
                    <span v-text="$t('instances.details.fetch_failed')"/>
                </strong>
                <p v-text="error.message"/>
            </div>
        </div>
        <!--    <div class="columns is-desktop">-->
        <!--      <div class="column is-half-desktop">-->
        <!--        <details-info v-if="hasInfo" :instance="instance" />-->
        <!--        <details-metadata v-if="hasMetadata" :instance="instance" />-->
        <!--      </div>-->
        <!--      <div class="column is-half-desktop">-->
        <!--        <details-health :instance="instance" />-->
        <!--      </div>-->
        <!--    </div>-->
        <div class="columns is-desktop">
            <div class="column is-half-desktop">
                <details-process :instance="instance" :details="processDetails"/>
                <!--                <details-gc v-if="hasGc" :instance="instance" />-->
            </div>
            <div class="column is-half-desktop">
                <details-threads :instance="instance" :details="statistical"/>
            </div>
        </div>
        <div class="columns is-desktop">
            <div class="column is-half-desktop">
                <details-memory :instance="instance" :jvmMemory="vmMemory" type="heap"/>
            </div>
            <div class="column is-half-desktop">
                <details-memory :instance="instance" :jvmMemory="vmMemory" type="nonheap"/>
            </div>
        </div>
        <div class="columns is-desktop">
            <div class="column is-half-desktop">
                <details-memory :instance="instance" :jvmMemory="vmMemory" type="edenSpace"/>
            </div>
            <div class="column is-half-desktop">
                <details-memory :instance="instance" :jvmMemory="vmMemory" type="oldGen"/>
            </div>
        </div>
        <!--    <div class="columns is-desktop">-->
        <!--      <div class="column is-half-desktop">-->
        <!--        <details-datasources v-if="hasDatasources" :instance="instance" />-->
        <!--      </div>-->
        <!--      <div class="column is-half-desktop">-->
        <!--        <details-caches v-if="hasCaches" :instance="instance" />-->
        <!--      </div>-->
        <!--    </div>-->
    </section>
</template>

<script>

    import Instance from '@/services/instance';
    import detailsCaches from './details-caches';
    import detailsDatasources from './details-datasources';
    import detailsGc from './details-gc';
    import detailsHealth from './details-health';
    import detailsInfo from './details-info';
    import detailsMemory from './details-memory';
    import detailsMetadata from './details-metadata';
    import detailsProcess from './details-process';
    import detailsThreads from './details-threads';
    import {VIEW_GROUP} from '../../index';
    import sio from 'socket.io-client';
    import {dashboardQuery} from '../../../opt/command';

    export default {
        /* eslint-disable vue/no-unused-components */
        components: {
            detailsHealth,
            detailsInfo,
            detailsProcess,
            detailsThreads,
            detailsDatasources,
            detailsMemory,
            detailsGc,
            detailsCaches,
            detailsMetadata
        },
        props: {
            instance: {
                type: Instance,
                required: true
            }
        },
        data: () => ({
            socketIoClient: null,
            hasLoaded: false,
            error: null,
            dashboard: {},
            vmMemory: {},
            processDetails: {},
            statistical:{},
            metrics: []
        }),
        computed: {

        },
        created() {
            // eslint-disable-next-line no-console
            console.log('init connect');
            this.connect();
            this.fetchMetricIndex();
        },
        methods: {
            connect(){
                this.socketIoClient = sio.connect('http://localhost:9092')
                this.socketIoClient.on('connect',function(){
                    // eslint-disable-next-line no-console
                    console.log('服务连接成功')
                });

                const graphqlMsg = {
                    query: dashboardQuery,
                    operationName :'dashboard',
                    variables: {machineId:3}
                };
                // eslint-disable-next-line no-console
                console.log(graphqlMsg)
                this.socketIoClient.emit('subMessage',JSON.stringify(graphqlMsg));
            },
            fetchMetricIndex() {
                const vm = this;
                this.socketIoClient.on('dashboard', function (data) {
                    vm.hasLoaded = true;

                    vm.dashboard = data.data.dashboard;
                    vm.statistical = data.data.dashboard.threadStatistical;
                    vm.vmMemory = data.data.dashboard.memory;
                    const jmvgc = data.data.dashboard.memory.gc;
                    const runtimeInfo = data.data.dashboard.runtimeInfo;
                    vm.pid = runtimeInfo.osName;
                    vm.uptime = {value: runtimeInfo.uptime.replace('s', ''), baseUnit: 'seconds'};
                    vm.systemCpuLoad = runtimeInfo.systemloadAverage;
                    vm.processCpuLoad = runtimeInfo.systemloadAverage;
                    vm.systemCpuCount = runtimeInfo.processors;
                    vm.gc = {
                        count: jmvgc.scavengeCount,
                        scavengeTime: jmvgc.scavengeTime
                    };
                    vm.processDetails = {
                        osName: runtimeInfo.osName,
                        pid: runtimeInfo.osName,
                        uptime: {value: runtimeInfo.uptime.replace('s', ''), baseUnit: 'seconds'},
                        systemCpuLoad: runtimeInfo.systemloadAverage,
                        processCpuLoad: runtimeInfo.systemloadAverage,
                        systemCpuCount: runtimeInfo.processors,
                        gc: {
                            count: jmvgc.scavengeCount,
                            scavengeTime: jmvgc.scavengeTime
                        }
                    }
                    // eslint-disable-next-line no-console
                    console.log(vm.dashboard)


                });
                // if (this.instance.hasEndpoint('metrics')) {
                //     this.error = null;
                //     try {
                //         const res = await this.instance.fetchMetrics();
                //         this.metrics = res.data.names;
                //     } catch (error) {
                //         console.warn('Fetching metric index failed:', error);
                //         this.error = error;
                //     }
                //     this.hasLoaded = true;
                // }
            }
        },
        //关闭组件执行
        destroyed() {
            // eslint-disable-next-line no-console
            console.log('destroyed');
            this.socketIoClient.close()
        },
        install({viewRegistry}) {
            viewRegistry.addView({
                name: 'instances/details',
                parent: 'instances',
                path: 'details',
                component: this,
                label: 'instances.details.label',
                group: VIEW_GROUP.INSIGHTS,
                order: 0
            });
        }
    }
</script>


<style lang="scss">
    @import "~@/assets/css/utilities";

    .details-header {
        margin-bottom: 1.5rem;
        display: flex;
        flex-direction: column;
        align-items: center;

        &__urls {
            width: 100%;
            text-align: center;
        }
    }
</style>
