<template>
    <div id="paillierBox">
  <card v-for="item in algorithms" :key="item.id" class="card-signup" header-classes="text-center" color="black">
          <template slot="header">
            <h3 class="card-title title-up">{{item.title}}</h3>
            <div class="social-line">
            </div>
          </template>
          <template>
              <div class="raw">
            <n-button @click="generate(item.id)">
                    生成公私钥对
            </n-button>
            <n-button @click="encryNum(item.id)">
                    加密数字
            </n-button>

                  <n-button @click="clear">
                      清空
                  </n-button>
              </div>
              <div class="raw">
            <n-button @click="addNum(item.id)">
                    数字相加
            </n-button>
              <n-button @click="mulNum(item.id)">
                  数字相乘
              </n-button>
            <n-button @click="decryNum(item.id)">
                    结果解密
            </n-button>
              </div>
              <br>

              <fg-input
                      class="no-border"
                      placeholder="请输入数字1"
                      addon-left-icon="now-ui-icons text_caps-small"
                      v-model="item.num1"
              >
              </fg-input>

              <fg-input
                      class="no-border"
                      placeholder="请输入数字2"
                      addon-left-icon="now-ui-icons users_circle-08"
                      v-model="item.num2"
              >
              </fg-input>
            <fg-input
                    class="no-border"
                    placeholder="公钥"
                    addon-left-icon="now-ui-icons users_circle-08"
                    v-model="item.publicKey"
            >
            </fg-input>

            <fg-input
                    class="no-border"
                    placeholder="私钥"
                    addon-left-icon="now-ui-icons users_circle-08"
                    v-model="item.privateKey"
            >
            </fg-input>
            <fg-input
                    class="no-border"
                    placeholder="计算结果"
                    addon-left-icon="now-ui-icons text_caps-small"
                    v-model="item.sum"
            >
            </fg-input>

          </template>

        </card>
    </div>

</template>

<script>

export default {
    name:'paillierBox',
    bodyClass: 'index-page',
    components:{
        Card,
        [Button.name]: Button,
        [FormGroupInput.name]: FormGroupInput
    },
    data(){
        return {
            paillier: {
                title: 'paillier同态加密',
                id:'paillier',
                publicKey:'',
                privateKey:'',
                truePrivatekey: Object,
                truePublickey: Object,
                num1: '',
                num2: '',
                sum: '',
                bn1: '',
                bn2: ''
            },
            algorithms: []
        }
    },
    mounted() {
        this.algorithms = [this.paillier]
    },
    methods:{
        clear() {
            this.paillier.publicKey = '';
            this.paillier.privateKey = '';
            this.paillier.truePrivatekey = Object;
            this.paillier.truePublickey = Object;
            this.paillier.num1 = '';
            this.paillier.num2 = '';
            this.paillier.sum = '';
            this.paillier.bn1 = '';
            this.paillier.bn2 = ''
        },
        generate(algorithm){
            if (algorithm === 'paillier') {
                const {publicKey, privateKey} = generateRandomKeys(512);
                this.paillier.publicKey = "(" + publicKey.n + "," + publicKey.g + ")";
                this.paillier.privateKey = "(" + privateKey.lambda + "," + privateKey.mu + ")";
                this.paillier.truePublickey = publicKey;
                this.paillier.truePrivatekey = privateKey;
                // console.log(publicKey);
                // console.log(privateKey);
            } else {
                this.fhe(algorithm)
            }
        },
        encryNum(algorithm){
            if (algorithm === 'paillier') {
                const publicKey = this.paillier.truePublickey;
                this.paillier.bn1 = bigInt(parseInt(this.paillier.num1)).mod(publicKey.n);
                while (this.paillier.bn1.lt(0)) this.paillier.bn1 = this.paillier.bn1.add(publicKey.n);  // The sign of the remainder will match the sign of the dividend and we don't want negative numbers
                this.paillier.bn2 = bigInt(parseInt(this.paillier.num2)).mod(publicKey.n);
                while (this.paillier.bn2.lt(0)) this.paillier.bn2 = this.paillier.bn2.add(publicKey.n);

                this.paillier.num1 = publicKey.encrypt(this.paillier.bn1);
                this.paillier.num2 = publicKey.encrypt(this.paillier.bn2);
            }
        },
        addNum(algorithm){
            if (algorithm === 'paillier') {
                const publicKey = this.paillier.truePublickey;
                // console.log("***"+ publicKey);
                this.paillier.sum = publicKey.addition(this.paillier.num1, this.paillier.num2);
            }
        },
        mulNum(algorithm) {
            if (algorithm === 'paillier') {
                this.paillier.sum = this.paillier.truePublickey.multiply(this.paillier.num1, this.paillier.bn2);
            }
        },
        decryNum(algorithm){
            if (algorithm === 'paillier') {
                const privateKey = this.paillier.truePrivatekey;
                this.paillier.sum = privateKey.decrypt(this.paillier.sum);
            }
        }
    }
}

import { Card, Button, FormGroupInput } from '@/components';
import {generateRandomKeys} from "../paillier";
import bigInt from 'big-integer';
import {Seal} from 'node-seal';
</script>

<style>
</style>
