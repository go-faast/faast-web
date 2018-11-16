import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardHeader, CardBody } from 'reactstrap'

export default compose(
  setDisplayName('Terms'),
)(() => (
  <div className='container my-4'>
  <Card>
    <CardHeader className='font-weight-bold'>
      <h4>Terms of Use</h4>
    </CardHeader>
    <CardBody className='text-muted'>
      <div>
        <h5 className='text-white'>Terms</h5>
        <p>
          By accessing the website at https://faa.st, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
        </p>
        <p>
          <b>The risk of loss in trading or holding Digital Currency can be substantial. You should therefore carefully consider whether trading or holding Digital Currency is suitable for you in light of your financial condition.</b>
        </p>
      </div>
      <div>
        <h5 className='text-white'>Use License</h5>
        <p>
          Permission is granted to temporarily download one copy of the materials (information or software) on faa.st website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose, or for any public display (commercial or non-commercial); attempt to decompile or reverse engineer any software contained on the faa.st website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server. This license shall automatically terminate if you violate any of these restrictions and may be terminated by faa.st at any time. Upon terminating your viewing of these materials or upon the termination of this license, you must destroy any downloaded materials in your possession whether in electronic or printed format.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Lost Passwords</h5>
        <p>
          <b><u>WARNING: In many cases, a lost of forgotten password can result in the inability to transfer digital currency!</u></b>
        </p>
        <p>
          <b><u>faa.st does not store passwords. IF YOU LOSE YOUR PASSWORD, YOU LOSE ALL ACCESS TO YOUR DIGITAL CURRENCY.</u></b>
        </p>
      </div>
      <div>
        <h5 className='text-white'>ELIGIBILITY</h5>
        <p>
          By accessing or using the Site, you represent and warrant that you are at least 18 years old and have not previously been suspended or removed from the Site. You also represent and warrant that you are not a resident of a Restricted Location as listed below. The list of Restricted States is subject to change at any time.
        </p>
        <p>
          RESTRICTED LOCATIONS: NORTH KOREA, IRAN, CUBA, NEW YORK STATE (USA), WASHINGTON STATE (USA), NEW HAMPSHIRE (USA)
        </p>
      </div>
      <div>
        <h5 className='text-white'>Third Parties</h5>
        <p>
          faa.st has no control over, or liability for, the delivery, quality, safety, legality or any other aspect of any goods or services that you may purchase or sell to or from a third party. faa.st is not responsible for ensuring that a buyer or a seller you may transact with will actually complete the transaction or is authorized to do so. If you experience a problem with any goods or services purchased from, or sold to, a third party in connection with Digital Currency transferred using the faa.st services, or if you have a dispute with such third party, you must resolve the dispute directly with that third party.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Digital Currency Protocols</h5>
        <p>
          faa.st does not own or control the underlying software protocols which govern the operation of Digital Currencies supported on our platform. In general, the underlying protocols are open source and anyone can use, copy, modify, and distribute them. By using faa.st, you acknowledge and agree (i) that faa.st is not responsible for operation of the underlying protocols and that faa.st makes no guarantee of their functionality, security, or availability; and (ii) that the underlying protocols are subject to sudden changes in operating rules (a/k/a “forks”), and that such forks may materially affect the value, function, and/or even the name of the Digital Currency . In the event of a fork, you agree that faa.st may temporarily suspend faa.st operations (with or without advance notice to you) and that faa.st may, in its sole discretion, decide whether or not to support (or cease supporting) either branch of the forked protocol entirely. You acknowledge and agree that faa.st assumes absolutely no responsibility whatsoever in respect of an unsupported branch of a forked protocol.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Conversion</h5>
        <p>
          Eligible users in certain jurisdictions may use the faa.st interface to assist in the conversion supported Digital Currency. <b>Faa.st is not a counterparty to these conversions.</b>
          Faa.st provides an API or "Application Program Interface" which provides digital currency addresses which are generally used to convert from one digital currency to another.
          Faa.st takes no responsibility if a conversion does not complete as expected. Any disputes should be directed to the owner of the associated digital currency address.
          The conversions are subject to the faa.st "conversion rate" for the given transaction, which are derived from digital currency networks.
          "Conversion rate" means the price of a given supported Digital Currency amount  as quoted on the faa.st API, which may be displayed on the faa.st website.
          The conversion rate is stated as a "Price" or as a "Rate," which is the price in terms of Digital Currency at which you may convert a supported Digital Currency on a digital currency network. You acknowledge that the price conversion rate may not be exactly as stated on the faa.st website, and that faa.st may add a margin or “spread” to the quoted conversion rate. You agree, as a condition of using any faa.st conversion Services, to accept the conversion rate as the sole conversion metric. Faa.st reserves the right to delay any conversion Service transaction if it perceives a risk of fraud or illegal activity. Faa.st does not guarantee the availability of its conversion Service, and the act of coverting supported Digital Currency does not result in a guarantee that you may convert your supported Digital Currency again at a later time.
          </p>
          <p>
            Each Conversion Service transaction is subject to a fee (a "Conversion Fee"). The applicable Conversion Fee is reflected in the price or rate displayed on the faa.st site.
          </p>
          <p>
            <b>You cannot cancel, reverse, or change any transaction marked as complete or pending.</b>
            If faa.st suspects the transaction involves (or has a high risk of involvement in) money laundering,
            terrorist financing, fraud, or any other type of financial crime; in response to a subpoena, court order, or other government order;
            if faa.st reasonably suspects that the transaction is erroneous; or if faa.st suspects the transaction relates to
            Prohibited Use or a Prohibited Business as set forth below. In such instances, faa.st will reverse the transaction
            and we are under no obligation to allow you to reinstate a purchase or sale order at the same price or on the same terms as
            the cancelled transaction.
          </p>
      </div>
      <div>
        <h5>Disclaimer</h5>
        <p>
          The materials on the faa.st website are provided on an 'as is' basis. faa.st makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights. Further, faa.st does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Limitation of Liability</h5>
        <p>
          IN NO EVENT SHALL FAA.ST, ITS AFFILIATES AND SERVICE PROVIDERS, OR ANY OF THEIR RESPECTIVE OFFICERS, DIRECTORS,
          AGENTS, JOINT VENTURERS, EMPLOYEES OR REPRESENTATIVES, BE LIABLE (A) FOR ANY LOST PROFITS OR ANY SPECIAL,
          INCIDENTAL, INDIRECT, INTANGIBLE, OR CONSEQUENTIAL DAMAGES, WHETHER BASED IN CONTRACT, TORT, NEGLIGENCE,
          STRICT LIABILITY, OR OTHERWISE, ARISING OUT OF OR IN CONNECTION WITH AUTHORIZED OR UNAUTHORIZED USE OF
          THE FAA.ST SITE OR THE FAA.ST SERVICES, OR THIS AGREEMENT, EVEN IF AN AUTHORIZED REPRESENTATIVE OF FAA.ST
          HAS BEEN ADVISED OF OR KNEW OR SHOULD HAVE KNOWN OF THE POSSIBILITY OF SUCH DAMAGES. THIS MEANS, BY WAY OF
          EXAMPLE ONLY (AND WITHOUT LIMITING THE SCOPE OF THE PRECEDING SENTENCE), THAT IF YOU CLAIM THAT FAA.ST FAILED
          TO PROCESS A BUY OR SELL TRANSACTION PROPERLY, YOUR DAMAGES ARE LIMITED TO NO MORE THAN THE VALUE OF THE SUPPORTED
            DIGITAL CURRENCY AT ISSUE IN THE TRANSACTION, AND THAT YOU MAY NOT RECOVER FOR LOST PROFITS, LOST BUSINESS OPPORTUNITES,
            OR OTHER TYPES OF SPECIAL, INCIDENTIAL, INDIRECT, INTANGIBLE, OR CONSEQUENTIAL DAMAGES IN EXCESS OF THE VALUE OF THE SUPPORTED
            DIGITAL CURRENCY AT ISSUE IN THE TRANSACTION.SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF INCIDENTAL OR
            CONSEQUENTIAL DAMAGES SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.

            <b>THE FAA.ST SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT ANY REPRESENTATION OR WARRANTY, WHETHER EXPRESS, IMPLIED OR STATUTORY.</b>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, FAA.ST SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF TITLE, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
              AND/OR NON-INFRINGEMENT. FAA.ST DOES NOT MAKE ANY REPRESENTATIONS OR WARRANTIES THAT ACCESS TO THE SITE, ANY PART OF THE FAA.ST SERVICES, OR ANY OF THE MATERIALS
              CONTAINED THEREIN, WILL BE CONTINUOUS, UNINTERRUPTED, TIMELY, OR ERROR-FREE.
          </p>
          <p>
          In no event shall faa.st or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the faa.st website, even if faa.st or a faa.st authorized representative has been notified orally or in writing of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties, or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Arbitration</h5>
        <p>
          <b>PLEASE READ THIS SECTION CAREFULLY – IT MAY SIGNIFICANTLY AFFECT YOUR LEGAL RIGHTS,
            INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT AND TO HAVE A JURY HEAR YOUR CLAIMS.</b>
          </p>
          <p>
          To expedite and control the cost of disputes, you and we agree that any legal or equitable claim
          arising out of or relating to your use of the Services or these Terms, including the formation, validity,
          enforceability, scope, or applicability of these Terms, including this Section 23 (referred to as a “Claim”)
          will be resolved as follows: except for claims for injunctive or equitable relief or claims regarding intellectual
          property rights (which may be brought in any competent court without the posting of a bond), any dispute arising
          under your use of the Services shall be finally settled on an individual basis through confidential,
          binding arbitration in accordance with the Canadian Arbitration Association's rules for arbitration of
          consumer-related disputes, available at www.canadianarbitrationassociation.ca, and you and
          faa.st hereby expressly waive trial by jury. This means that all claims other than intellectual
          property lawsuits, such as copyright or trademark infringement lawsuits, or claims seeking non-monetary
          relief would be subject to binding arbitration. This includes claims which may pre-date this agreement.
          The arbitration shall take place in Ontario, Canada, in the English language and the arbitral
          decision may be enforced in any court. At your request, hearings may be conducted in person or by telephone
          and the arbitrator may provide for submitting and determining motions on briefs, without oral hearings.
          Payment of all filing, administration and arbitrator fees will be governed by the CAA' rules.
          The prevailing party in any action or proceeding to enforce this agreement shall be entitled to costs and attorneys' fees.
          To begin an arbitration proceeding, you must send a letter by e-mail to legal@faa.st.
        </p>
        <p>
          ADDITIONALLY, YOU HEREBY WAIVE YOUR RIGHT TO PARTICIPATE IN A className ACTION LAWSUIT OR className-WIDE ARBITRATION.
          We each agree that any dispute resolution proceedings will be conducted only on an individual basis and not in a className,
          consolidated or representative action. If for any reason a claim proceeds in court rather than in arbitration,
          we each waive any right to a jury trial. If a court or federal regulator with oversight over faa.st decides that
          applicable law precludes enforcement of any of this section’s limitations as to a particular claim for relief, then that
          claim (and only that claim) must be severed from the arbitration and may be brought in court, subject to your and faa.st's
          right to appeal the court's decision. All other claims will be arbitrated.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Accuracy of materials</h5>
        <p>
          The materials appearing on the faa.st website could include technical, typographical, or photographic errors. faa.st does not warrant that any of the materials on its website are accurate, complete or current. faa.st may make changes to the materials contained on its website at any time without notice. However faa.st does not make any commitment to update the materials.
        </p>
      </div>
      <div>
        <h5 className='text-white'>General Provisions</h5>
        <p>
          Entire Agreement: This Agreement, and the Privacy Policy by reference herein comprise the entire understanding
          and agreement between you and faa.st as to the subject matter hereof, and supersedes any and all prior discussions,
          agreements and understandings of any kind (including without limitation any prior versions of this Agreement), and
          every nature between and among you and faa.st. Section headings in this Agreement are for convenience only, and
          shall not govern the meaning or interpretation of any provision of this Agreement.
        </p>
        <p>
          Assignment:  You may not assign any rights and/or licenses granted under this Agreement.
          We reserve the right to assign our rights without restriction, including without limitation to
          any faa.st affiliates or subsidiaries, or to any successor in interest of any business associated
          with the faa.st Services. Any attempted transfer or assignment in violation hereof shall be null and void.
          Subject to the foregoing, this Agreement will bind and inure to the benefit of the parties, their successors and permitted assigns.
        </p>
        <p>
          Severability: If any provision of this Agreement shall be determined to be invalid or unenforceable under any rule,
          law or regulation or any governmental agency, local, provincial, or federal, such provision will be changed and interpreted
          to accomplish the objectives of the provision to the greatest extent possible under any applicable law and the validity
          or enforceability of any other provision of this Agreement shall not be affected.
        </p>
        <p>
          Change of Control: In the event that faa.st is acquired by or merged with a third party entity, we reserve the right,
          in any of these circumstances, to transfer or assign the information we have collected from you as part of such merger,
          acquisition, sale, or other change of control.
        </p>
        <p>
          Survival: All provisions of this Agreement which by their nature extend beyond the expiration or termination of this
          Agreement, including, without limitation, sections pertaining to suspension or termination, faa.st Account cancellation,
          debts owed to faa.st, general use of the faa.st Site, disputes with faa.st, and general provisions, shall survive
          the termination or expiration of this Agreement.
        </p>
        <p >
          Force Majeure: We shall not be liable for delays, failure in performance or interruption of service which result directly
          or indirectly from any cause or condition beyond our reasonable control, including but not limited to, any delay or failure
          due to any act of God, act of civil or military authorities, act of terrorists, civil disturbance, war, strike or other
          labor dispute, fire, interruption in telecommunications or Internet services or network provider services, failure of
          equipment and/or software, other catastrophe or any other occurrence which is beyond our reasonable control and shall
          not affect the validity and enforceability of any remaining provisions.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Links</h5>
        <p>
          faa.st has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by faa.st of the site. Use of any such linked website is at the user's own risk.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Modifications</h5>
        <p>
          faa.st may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
        </p>
      </div>
      <div>
        <h5 className='text-white'>Governing Law</h5>
        <p>
          These terms and conditions are governed by and construed in accordance with the laws of Ontario, Canada and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
        </p>
      </div>
    </CardBody>
    </Card>
  </div>
))
