<template>
  <card class="card-signup" header-classes="text-center" color="black">
          <template slot="header">
            <h3 class="card-title title-up">同态加密成绩查询系统</h3>
            <div class="social-line">
              <p v-show="showTip" class="tip">{{uploadTip}}</p>
            </div>
          </template>
          <template>
            <fg-input
                    class="no-border"
                    placeholder="用户名"
                    addon-left-icon="now-ui-icons users_circle-08"
                    v-model="username"
            >
            </fg-input>

            <fg-input
                    class="no-border"
                    placeholder="语文成绩"
                    addon-left-icon="now-ui-icons users_circle-08"
                    v-model="yuwenchengji"
            >
            </fg-input>

            <fg-input
                    class="no-border"
                    placeholder="数学成绩"
                    addon-left-icon="now-ui-icons text_caps-small"
                    v-model="shuxuechengji"
            >
            </fg-input>

            <fg-input
                    class="no-border"
                    placeholder="英语成绩"
                    addon-left-icon="now-ui-icons users_circle-08"
                    v-model="yingyuchengji"
            >
            </fg-input>

            <fg-input
                    class="no-border"
                    placeholder="政治成绩"
                    addon-left-icon="now-ui-icons text_caps-small"
                    v-model="zhengzhichengji"
            >
            </fg-input>

          </template>
          <div class="card-footer text-center">
            <n-button type="neutral" round size="lg" @click="upload">提交</n-button>
          </div>
        </card>

</template>

<script>
import { Card, Button, FormGroupInput } from '@/components';
import {generateRandomKeys} from "../paillier";
import bigInt from 'big-integer';
import {Seal} from 'node-seal';

export default {
  name: 'chengji',
  data () {
      return {
          yuwenchengji: '',
          shuxuechengji: '',
          yingyuchengji: '',
          zhengzhichengji: '',
          username: '',
          publicKey: '',
          privateKey: '',
          showTip: true,
          uploadTip: '',
          Morfix: '',
      }
  },
  mounted () {
      let result = generateRandomKeys(512); // Change to at least 2048 bits in production state
      this.privateKey = result['privateKey'];
      this.publicKey = result['publicKey'];
      // this.fhe();
      // console.log(typeof(result));
  },
  methods: {
    async fhe(){
        this.Morfix = await Seal();
        const schemeType = this.Morfix.SchemeType.BFV;
        const securityLevel = this.Morfix.SecurityLevel.tc128;
        const polyModulusDegree = 4096;
        const bitSizes = [36, 36, 37];
        const bitSize = 20;
        const params = this.Morfix.EncryptionParameters(schemeType);

        // Set the PolyModulusDegree
        params.setPolyModulusDegree(polyModulusDegree);

        // Create a suitable set of CoeffModulus primes
        params.setCoeffModulus(
            this.Morfix.CoeffModulus.Create(polyModulusDegree, Int32Array.from(bitSizes))
        );

        // Set the PlainModulus to a prime of bitSize 20.
        params.setPlainModulus(
            this.Morfix.PlainModulus.Batching(polyModulusDegree, bitSize)
        );

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

        const encoder = this.Morfix.BatchEncoder(context);
        const keyGenerator = this.Morfix.KeyGenerator(context);
        const publicKey = keyGenerator.publicKey();
        const secretKey = keyGenerator.secretKey();
        const encryptor = this.Morfix.Encryptor(context, publicKey);
        const decryptor = this.Morfix.Decryptor(context, secretKey);
        const evaluator = this.Morfix.Evaluator(context);

        // Create data to be encrypted
        const array = Int32Array.from([1, 2, 3, 4, 5]);
        // Encode the Array
        const plainText = encoder.encode(array);
        console.log('plaintext',plainText);
        const cipherText = encryptor.encrypt(plainText);
        console.log('cipherText',cipherText);

        // evaluator.add(cipherText, cipherText, cipherText); // Op (A), Op (B), Op (Dest)

        // Or create return a new cipher with the result (omitting destination parameter)
        // const cipher2x = evaluator.add(cipherText, cipherText)

        // Decrypt the CipherText
        const decryptedPlainText = decryptor.decrypt(cipherText);
        // Decode the PlainText
        const decodedArray = encoder.decode(decryptedPlainText);

        console.log('decodedArray', decodedArray);
    },
    upload() {
      if (this.yuwenchengji === '' ||
        this.shuxuechengji === '' ||
        this.zhengzhichengji === '' ||
        this.yingyuchengji === '' ||
        this.username === '') {
        if (this.username !== '') this.uploadTip = '成绩不能为空'
        else this.uploadTip = '用户名不能为空'
        return
      }
      let num1 = parseInt(this.yuwenchengji);
      let num2 = parseInt(this.shuxuechengji);
      let num3 = parseInt(this.yingyuchengji);
      let num4 = parseInt(this.zhengzhichengji);

      let bn1 = bigInt(num1).mod(this.publicKey.n);
      while (bn1.lt(0)) bn1 = bn1.add(this.publicKey.n);  // The sign of the remainder will match the sign of the dividend and we don't want negative numbers
      let bn2 = bigInt(num2).mod(this.publicKey.n);
      while (bn2.lt(0)) bn2 = bn2.add(this.publicKey.n);  // The sign of the remainder will match the sign of the dividend and we don't want negative numbers
      let bn3 = bigInt(num3).mod(this.publicKey.n);
      while (bn3.lt(0)) bn3 = bn3.add(this.publicKey.n);  // The sign of the remainder will match the sign of the dividend and we don't want negative numbers
      let bn4 = bigInt(num4).mod(this.publicKey.n);
      while (bn4.lt(0)) bn4 = bn4.add(this.publicKey.n);  // The sign of the remainder will match the sign of the dividend and we don't want negative numbers

      let c1 = this.publicKey.encrypt(bn1);
      let c2 = this.publicKey.encrypt(bn2);

      let c3 = this.publicKey.encrypt(bn3);
      let c4 = this.publicKey.encrypt(bn4);

      console.log('num1:', num1.toString());
      console.log('c1:', c1.toString(16), '\n');

      console.log('num2:', num2.toString());
      console.log('c2:', c2.toString(16), '\n');

      console.log('num3:', num3.toString());
      console.log('c3:', c3.toString(16), '\n');

      console.log('num4:', num4.toString());
      console.log('c4:', c4.toString(16), '\n');

      this.$http.post(
          this.loginApiUrl,
          {
              // 'grant_type': 'password',
              'username': this.base64.encode(this.username),
              'password': this.base64.encode(this.password),
              'access_token': this.base64.encode(this.accessToken),
              'captcha': this.base64.encode(this.loginCaptcha.toUpperCase())
          },
          {
              headers: {
                  'X-CSRFToken': document.cookie.split('csrftoken=')[1]
              }
          },
          { emulateJSON: false }
      ).then((response) => {
          if (response.body.code === 0) {
              if (response.body.tokenAuth === 0) {
                  window.sessionStorage.setItem('access_token', response.body.token)
              }
              if (response.body.teamSet === 0) {
                  $('#loginModal').modal('close')
                  this.getCaptcha()
                  $('#setTeamModal').modal('open')
              } else {
                  this.$router.push('/ctf/')
              }
          } else if (response.body.code === 1) {
              this.loginTip = '用户名或密码错误'
              this.getCaptcha()
          } else if (response.body.code === 2) {
              this.loginTip = '验证码错误或已过期'
              this.getCaptcha()
          }
      }).catch(() => {
          alert('Login error')
          this.$router.replace('/')
          this.getCaptcha()
      })
      // let encryptedSum = this.publicKey.addition(c1, c2, c3);
      // console.log('E(num1 + num2 + num3):', encryptedSum.toString(16), '\n');

    }
  },
  bodyClass: 'index-page',
  components: {
    Card,
    [Button.name]: Button,
    [FormGroupInput.name]: FormGroupInput
  }
};
</script>

<style>

</style>