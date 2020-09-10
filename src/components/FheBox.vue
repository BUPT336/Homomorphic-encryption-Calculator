<template>
    <div id="fheBox">
        <card class="" id="fhe-card" header-classes="text-center" color="black">
            <!--<template slot="header">-->
            <br>
                <h3 class="card-title title-up">FHE全同态加密</h3>
                <div class="social-line">
                </div>
            <!--</template>-->
            <div class="container">
            <tabs slot="raw-content" tab-content-classes="text-center">
            <tab-pane v-for="item in algorithms" :key="item.id" >
            <template slot="label">
                <div @click="changeMode(item.id)">
                <i class="now-ui-icons objects_umbrella-13"></i> {{item.title}}
                </div>
            </template>
                <template>
                <div class="raw">
                <div class="col-md-6" v-for="p in params" :key="p.title">
                <drop-down
                        class="dropdown"
                        :title="p.title"
                >
                    <a class="dropdown-header" style="color: #2c2c2c">{{p.id}}</a>
                    <a class="dropdown-item"
                       v-for="select in p.selectors"
                       :key="select"
                       @click="setParams(select, p.id)">{{select}} Bits</a>
                </drop-down>
                </div>
                </div>
                </template>
                <br>
                <template>
                    <fg-input
                            class="no-border"
                            placeholder="Plain Modulus (Bit Size)"
                            addon-left-icon="now-ui-icons users_circle-08"
                            v-model="bitSize"
                            v-show="mode === 'BFV'"
                    >
                    </fg-input>
                <div class="raw">
                    <n-button @click="fhe('generate')">
                        生成公私钥对
                    </n-button>
                    <n-button @click="fhe('encryNum')">
                        加密数字
                    </n-button>

                    <n-button @click="clear">
                        清空
                    </n-button>
                </div>
                <div class="raw">
                    <n-button @click="fhe('addNum')">
                        数字相加
                    </n-button>
                    <n-button @click="fhe('mulNum')">
                        数字相乘
                    </n-button>
                    <n-button @click="fhe('decryNum')">
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
                        v-model="item.result"
                >
                </fg-input>

            </template>
            </tab-pane>
            </tabs>
            </div>
        </card>
    </div>

</template>

<script>

    import TabPane from "./Tabs/Tab";
    import {Seal} from 'node-seal';
    import {
        Button,
        Card,
        Checkbox,
        Tabs,
        Radio,
        FormGroupInput,
        DropDown,
        Slider,
        Switch
    } from '@/components';

    export default {
        name:'FheBox',
        bodyClass: 'index-page',
        components:{
            TabPane,
            Card,
            Tabs,
            DropDown,
            [Checkbox.name]: Checkbox,
            [Radio.name]: Radio,
            [Button.name]: Button,
            [Switch.name]: Switch,
            [FormGroupInput.name]: FormGroupInput
        },
        data(){
            return {
                generated: false,
                mode: 'BFV',
                params: {
                  securityLevel: {
                      id: 'Security Level',
                      title: 'Security Level',
                      selectors: ['128', '192', '256'],
                  },
                  polyModulusDegree: {
                      id: 'Polymodulus Degree',
                      title: 'Polymodulus',
                      selectors: ['1024', '2048', '4096', '8192', '16384']
                  }
                },
                bitSize: '',
                securityLevel: 0,
                polyModulusDegree: 0,
                Coefficient: [],
                BFV: {
                    title: 'BFV同态加密',
                    id:'BFV',
                    publicKey:'',
                    privateKey:'',
                    num1: '',
                    num2: '',
                    result: '',
                    resultObj: Object,
                    truePublicKey: Object,
                    truePrivateKey: Object,
                    encryText1: Object,
                    encryText2: Object,
                    encryptor: Object,
                    decryptor: Object,
                    encoder: Object,
                    evaluator: Object
                },
                CKKS: {
                    title: 'CKKS同态加密',
                    id:'CKKS',
                    publicKey:'',
                    privateKey:'',
                    encryText1: Object,
                    encryText2: Object,
                    num1: '',
                    num2: '',
                    result: '',
                    resultObj: Object,
                    truePublicKey: Object,
                    truePrivateKey: Object,
                    encryptor: Object,
                    decryptor: Object,
                    encoder: Object,
                    evaluator: Object
                },
                algorithms: []
            }
        },
        mounted() {
            this.algorithms = [this.BFV, this.CKKS];
        },
        methods:{
            changeMode(mode) {
                if (mode === 'CKKS') {
                    this.mode = 'CKKS';
                } else {
                    this.mode = 'BFV';
                }
                this.clear();
            },
            clear() {
                this.params.polyModulusDegree.title = 'Polymodulus';
                this.params.securityLevel.title = 'Security Level';
                this.bitSize = '';
                this.generated = false;
                if (this.mode === 'BFV') {
                    this.BFV.publicKey = '';
                    this.BFV.privateKey = '';
                    this.BFV.num1 = '';
                    this.BFV.num2 = '';
                    this.BFV.result = '';
                    this.BFV.resultObj = Object;
                    this.BFV.encryText1 = Object;
                    this.BFV.encryText2 = Object;
                    this.BFV.encryptor = Object;
                    this.BFV.decryptor = Object;
                    this.BFV.encoder = Object;
                    this.BFV.evaluator = Object;
                    this.BFV.truePublicKey = Object;
                    this.BFV.truePrivateKey = Object;
                } else {
                    this.CKKS.publicKey = '';
                    this.CKKS.privateKey = '';
                    this.CKKS.num1 = '';
                    this.CKKS.num2 = '';
                    this.CKKS.result = '';
                    this.CKKS.resultObj = Object;
                    this.CKKS.encryText1 = Object;
                    this.CKKS.encryText2 = Object;
                    this.CKKS.encryptor = Object;
                    this.CKKS.decryptor = Object;
                    this.CKKS.encoder = Object;
                    this.CKKS.evaluator = Object;
                    this.CKKS.truePublicKey = Object;
                    this.CKKS.truePrivateKey = Object;
                }
            },
            setParams(bits, param) {
                if (param === this.params.securityLevel.id) {
                    this.params.securityLevel.title = bits + ' Bits';
                    this.securityLevel = parseInt(bits);
                } else if (param === this.params.polyModulusDegree.id) {
                    this.params.polyModulusDegree.title = bits + ' Bits';
                    this.polyModulusDegree = parseInt(bits);
                }
            },
            async fhe(op){
                if (op !== 'generate' && !this.generated) {
                    // console.log('generate first');
                    return;
                } else if (op === 'generate' && !this.generated) {
                    this.Morfix = await Seal();
                    let schemeType = '';
                    let securityLevel = '';
                    let bitSizes = [];
                    if (this.mode === 'BFV') {
                        schemeType = this.Morfix.SchemeType.BFV;
                    } else {
                        schemeType = this.Morfix.SchemeType.CKKS;
                    }
                    if (this.securityLevel === 128) {
                        securityLevel = this.Morfix.SecurityLevel.tc128;
                    } else if (this.securityLevel === 192) {
                        securityLevel = this.Morfix.SecurityLevel.tc192;
                    } else if (this.securityLevel === 256) {
                        securityLevel = this.Morfix.SecurityLevel.tc256;
                    }
                    let polyModulusDegree = this.polyModulusDegree;
                    if (this.mode === 'BFV') {
                        if (securityLevel === this.Morfix.SecurityLevel.tc128) {
                            if (polyModulusDegree === 1024) {
                                bitSizes = [27];
                            } else if (polyModulusDegree === 2048) {
                                bitSizes = [54];
                            } else if (polyModulusDegree === 4096) {
                                bitSizes = [36, 36, 37];
                            } else if (polyModulusDegree === 8192) {
                                bitSizes = [43, 43, 44, 44, 44]
                            } else if (polyModulusDegree === 16384) {
                                bitSizes = [48, 48, 48, 49, 49, 49, 49, 49, 49];
                            }
                        } else if (securityLevel === this.Morfix.SecurityLevel.tc192) {
                            if (polyModulusDegree === 1024) {
                                bitSizes = [19];
                            } else if (polyModulusDegree === 2048) {
                                bitSizes = [37];
                            } else if (polyModulusDegree === 4096) {
                                bitSizes = [25,25,25];
                            } else if (polyModulusDegree === 8192) {
                                bitSizes = [38,38,38,38]
                            } else if (polyModulusDegree === 16384) {
                                bitSizes = [50,50,50,50,50,50];
                            }
                        } else if (securityLevel === this.Morfix.SecurityLevel.tc256) {
                            if (polyModulusDegree === 1024) {
                                bitSizes = [14];
                            } else if (polyModulusDegree === 2048) {
                                bitSizes = [29];
                            } else if (polyModulusDegree === 4096) {
                                bitSizes = [58];
                            } else if (polyModulusDegree === 8192) {
                                bitSizes = [39, 39, 40]
                            } else if (polyModulusDegree === 16384) {
                                bitSizes = [47, 47, 47, 48, 48];
                            }
                        }
                    } else if (securityLevel === this.Morfix.SecurityLevel.tc128) {
                        if (polyModulusDegree === 1024) {
                            bitSizes = [27];
                        } else if (polyModulusDegree === 2048) {
                            bitSizes = [54];
                        } else if (polyModulusDegree === 4096) {
                            bitSizes = [46,16,46];
                        } else if (polyModulusDegree === 8192) {
                            bitSizes = [60,20,20,20,20,60]
                        } else if (polyModulusDegree === 16384) {
                            bitSizes = [60,39,39,39,39,39,39,39,39,60];
                        }
                    } else if (securityLevel === this.Morfix.SecurityLevel.tc192) {
                        if (polyModulusDegree === 1024) {
                            bitSizes = [19];
                        } else if (polyModulusDegree === 2048) {
                            bitSizes = [37];
                        } else if (polyModulusDegree === 4096) {
                            bitSizes = [29,16,29];
                        } else if (polyModulusDegree === 8192) {
                            bitSizes = [56,20,20,56]
                        } else if (polyModulusDegree === 16384) {
                            bitSizes = [60,39,39,39,39,60];
                        }
                    } else if (securityLevel === this.Morfix.SecurityLevel.tc256) {
                        if (polyModulusDegree === 1024) {
                            bitSizes = [14];
                        } else if (polyModulusDegree === 2048) {
                            bitSizes = [29];
                        } else if (polyModulusDegree === 4096) {
                            bitSizes = [58];
                        } else if (polyModulusDegree === 8192) {
                            bitSizes = [39,20,20,39]
                        } else if (polyModulusDegree === 16384) {
                            bitSizes = [60,39,39,39,60];
                        }
                    }
                    let bitSize = parseInt(this.bitSize);
                    let params = this.Morfix.EncryptionParameters(schemeType);

                    // Set the PolyModulusDegree
                    params.setPolyModulusDegree(polyModulusDegree);

                    // Create a suitable set of CoeffModulus primes
                    params.setCoeffModulus(
                        this.Morfix.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes))
                    );

                    // Set the PlainModulus to a prime of bitSize 20.
                    if (this.mode === 'BFV') {
                        params.setPlainModulus(
                            this.Morfix.PlainModulus.Batching(polyModulusDegree, bitSize)
                        );
                    }

                    const context = this.Morfix.Context(
                        params, // Encryption Parameters
                        true, // ExpandModChain
                        securityLevel // Enforce a security level
                    );

                    if (!context.parametersSet()) {
                        throw new Error(
                            'Could not set the parameters in the given context. Please try different encryption parameters.'
                        )
                    }
                    let encoder;
                    if (this.mode === 'BFV') {
                        encoder = this.Morfix.BatchEncoder(context);
                    } else {
                        encoder = this.Morfix.CKKSEncoder(context);
                    }
                    const keyGenerator = this.Morfix.KeyGenerator(context);

                    const publicKey = keyGenerator.publicKey();
                    const secretKey = keyGenerator.secretKey();
                    // console.log(publicKey, secretKey);
                    if (this.mode === 'BFV') {
                        this.BFV.publicKey = publicKey.save();
                        this.BFV.privateKey = secretKey.save();
                        this.BFV.truePublicKey = publicKey;
                        this.BFV.truePrivateKey = secretKey;
                        this.BFV.encryptor = this.Morfix.Encryptor(context, publicKey);
                        this.BFV.decryptor = this.Morfix.Decryptor(context, secretKey);
                        this.BFV.evaluator = this.Morfix.Evaluator(context);
                        this.BFV.encoder = encoder;
                    } else {
                        this.CKKS.publicKey = publicKey.save();
                        this.CKKS.privateKey = secretKey.save();
                        this.CKKS.truePublicKey = publicKey;
                        this.CKKS.truePrivateKey = secretKey;
                        this.CKKS.encryptor = this.Morfix.Encryptor(context, publicKey);
                        this.CKKS.decryptor = this.Morfix.Decryptor(context, secretKey);
                        this.CKKS.evaluator = this.Morfix.Evaluator(context);
                        this.CKKS.encoder = encoder;
                    }
                    this.generated = true;
                    // console.log('generate success');
                } else if (op === 'generate') {
                    // console.log('error generate');
                    return;
                }
                // Create data to be encrypted
                if (op === 'encryNum') {
                    // Show each encrypted num
                    // Encode the Array
                    if (this.mode === 'BFV') {
                        const array1 = Int32Array.from([parseInt(this.BFV.num1)]);
                        const array2 = Int32Array.from([parseInt(this.BFV.num2)]);
                        const plainText1 = this.BFV.encoder.encode(array1);
                        // console.log(plainText1.save());
                        const plainText2 = this.BFV.encoder.encode(array2);
                        this.BFV.encryText1 = this.BFV.encryptor.encrypt(plainText1);
                        this.BFV.encryText2 = this.BFV.encryptor.encrypt(plainText2);
                        this.BFV.resultObj = this.BFV.encryptor.encrypt(plainText1);
                        this.BFV.num1 = this.BFV.encryText1.save();
                        this.BFV.num2 = this.BFV.encryText2.save();

                    } else {
                        const array1 = Float64Array.from([parseFloat(this.CKKS.num1)]);
                        const array2 = Float64Array.from([parseFloat(this.CKKS.num2)]);
                        const plainText1 = this.CKKS.encoder.encode(array1,Math.pow(2, 20));
                        const plainText2 = this.CKKS.encoder.encode(array2,Math.pow(2, 20));
                        this.CKKS.encryText1 = this.CKKS.encryptor.encrypt(plainText1);
                        this.CKKS.encryText2 = this.CKKS.encryptor.encrypt(plainText2);
                        this.CKKS.resultObj = this.CKKS.encryptor.encrypt(plainText1);
                        this.CKKS.num1 = this.CKKS.encryText1.save();
                        this.CKKS.num2 = this.CKKS.encryText2.save();
                    }
                } else if (op === 'addNum') {
                    if (this.mode === 'BFV') {
                        this.BFV.evaluator.add(this.BFV.encryText1, this.BFV.encryText2, this.BFV.resultObj); // Op (A), Op (B), Op (Dest)
                        this.BFV.result = this.BFV.resultObj.save();
                    } else {
                        this.CKKS.evaluator.add(this.CKKS.encryText1, this.CKKS.encryText2, this.CKKS.resultObj);
                        this.CKKS.result = this.CKKS.resultObj.save();
                    }
                } else if (op === 'mulNum') {
                    if (this.mode === 'BFV') {
                        this.BFV.evaluator.multiply(this.BFV.encryText1, this.BFV.encryText2, this.BFV.resultObj); // Op (A), Op (B), Op (Dest)
                        // console.log(this.BFV.result);
                        this.BFV.result = this.BFV.resultObj.save();
                    } else {
                        this.CKKS.evaluator.multiply(this.CKKS.encryText1, this.CKKS.encryText2, this.CKKS.resultObj);
                        this.CKKS.result = this.CKKS.resultObj.save();
                    }
                } else if (op === 'decryNum') {
                    // Or create return a new cipher with the result (omitting destination parameter)
                    // const cipher2x = evaluator.add(cipherText, cipherText)

                    // Decrypt the CipherText
                    if (this.mode === 'BFV') {
                        const decryptedPlainText = this.BFV.decryptor.decrypt(this.BFV.resultObj);
                        // Decode the PlainText
                        this.BFV.result = this.BFV.encoder.decode(decryptedPlainText)[0];
                        // console.log(this.BFV.result)
                    } else {
                        const decryptedPlainText = this.CKKS.decryptor.decrypt(this.CKKS.resultObj);
                        // Decode the PlainText
                        this.CKKS.result = this.CKKS.encoder.decode(decryptedPlainText)[0];
                    }
                }

            },
        }
    }
</script>

<style>
    #fhe-card {
        width: 100%;
        opacity: 0.8;
    }
    .raw .col-md-6 {
        display: inline-block;
    }
</style>
