#  Dummy Repository to test configs and some other simple stuff


# Live deploy with existing collapsible

<details>
  <summary>Click to expand the puml definition!</summary>

```plantuml
@startuml
!define osaPuml https://raw.githubusercontent.com/Crashedmind/PlantUML-opensecurityarchitecture2-icons/master
!include osaPuml/Common.puml
!include <osa/ics/drive/drive>
!include <logos/gitlab>
!include <cloudogu/dogus/nexus>
!include <cloudogu/dogus/jenkins>

title Acme Adapter Live Deployment



rectangle "CI/Build Pipeline" as ci #d4dddd{
	rectangle "<$gitlab>\ngitlab" as Gitlab #ffffff
	artifact  acme as "acme-adapter.jar" #f3fff3 {
	}

}

node "Mercateo Nexus" as nexus_node #FFFFE0 {
	rectangle "<$nexus>\nNexus" as Nexus #ffffff
}

rectangle "Deployment pipeline" as deploy #f4fff4 {
    artifact "acme-adapter.jar" as nexus_jar #ffffff {
        }
    node "Jenkins Superman" as jenkins_node #FFFFE0 {
    	 rectangle "<$jenkins>\nJenkins" as jenkins_instance #ffffff
    	 rectangle "Pipeline.SBserver\n <$drive>" as Pipeline.SBServer {
             }
    }


}

node "adama31"  as adama31 #aliceblue;line:blue;line.dotted;text:blue {
}
node "adama32"  as adama32 #aliceblue;line:blue;line.dotted;text:blue {
}




actor developer

developer -> Gitlab : 1. Push
Gitlab ->  acme
'note top of Gitlab : Also triggers a version file change on https://bitbucket.acme.co/scm/ci/puppet.git/, which is required for auto-deployment
acme -> Nexus: publish artifact
Nexus -> nexus_jar: pull artifact
developer -> deploy : 2. Manually trigger job
nexus_jar -> jenkins_instance
jenkins_instance -> Pipeline.SBServer : Deploy artifact to live
Pipeline.SBServer -> adama31
Pipeline.SBServer -> adama32

@enduml

```

</details>


It's just that! You have the live deployment


# The devstage

<details>
  <summary>Click to expand the puml definition!</summary>

```plantuml 
@startuml
!define osaPuml https://raw.githubusercontent.com/Crashedmind/PlantUML-opensecurityarchitecture2-icons/master
!include osaPuml/Common.puml
!include <osa/ics/drive/drive>
!include <logos/gitlab>
!include <cloudogu/dogus/nexus>
!include <cloudogu/dogus/jenkins>

title Acme Adapter Dev-Stage Deployment



rectangle "CI/Build Pipeline" as ci #d4dddd{
	rectangle "<$gitlab>\ngitlab" as Gitlab #ffffff
	artifact  acme as "acme-adapter.jar" #f3fff3 {
	}
	node "Mercateo Nexus" as nexus_node #FFFFE0 {
	 rectangle "<$nexus>\nNexus" as Nexus #ffffff
	}
}

rectangle "Deployment pipeline" as deploy #f4fff4 {
    artifact "acme-adapter.jar" as nexus_jar #ffffff {
        }
    node "Jenkins CI2" as jenkins_node #FFFFE0 {
    	 rectangle "<$jenkins>\nJenkins" as jenkins_instance #ffffff
    	 rectangle "maven_release\n <$drive>" as maven_release {
             }
    }


}

node "Dev-stage minion 5"  as minion_5 #aliceblue;line:blue;line.dotted;text:blue {
}
'node "Dev-stage minion 6"  as minion_6 #aliceblue;line:blue;line.dotted;text:blue {
'}




actor developer

developer --> Gitlab : Push
Gitlab ->  acme
note top of Gitlab : Also triggers a version file change on https://bitbucket.acme.co/scm/ci/puppet.git/ which is required for auto-deployment
acme -> nexus_node
Nexus ----> nexus_jar: Listen releases
nexus_jar --> jenkins_instance
jenkins_instance -left-> maven_release : Deploy artifact to dev stage
maven_release --> minion_5

@enduml
```

</details>

